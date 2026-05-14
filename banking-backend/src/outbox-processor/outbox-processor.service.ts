import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { maskEmail, hashIdentifier } from './utils';
import { Neo4jService } from '../neo4j/neo4j.service';
@Injectable()
export class OutboxProcessorService {
  private readonly logger = new Logger(OutboxProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly neo4jService: Neo4jService 
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutboxEvents() {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Nhặt 50 events (Thêm điều kiện isFailed = false)
        const unprocessedEvents: any[] = await tx.$queryRaw`
          SELECT * FROM "OutboxEvent"
          WHERE "isAnalyticsProcessed" = false AND "isFailed" = false
          ORDER BY "createdAt" ASC
          LIMIT 50
          FOR UPDATE SKIP LOCKED;
        `;

        if (!unprocessedEvents || unprocessedEvents.length === 0) {
          return; 
        }

        this.logger.log(`📊 [Pipeline Worker] Bắt đầu xử lý ${unprocessedEvents.length} Outbox Events...`);

        for (const event of unprocessedEvents) {
          try {
            const payload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;

              const flattenedData = {
                eventId: event.id,
                eventType: event.eventType, // Giả sử là 'TRANSFER'
                fromAccount: payload.fromAccountId ? hashIdentifier(payload.fromAccountId) : null,
                toAccount: payload.toAccountId ? hashIdentifier(payload.toAccountId) : null,
                transactionAmount: payload.amount ? parseFloat(payload.amount) : 0, 
                occurredAt: event.createdAt,
              };

              // [LOGIC AML NEO4J]: CHỈ VẼ ĐỒ THỊ KHI ĐÓ LÀ LỆNH CHUYỂN KHOẢN (CÓ NGƯỜI GỬI VÀ NGƯỜI NHẬN)
              if (flattenedData.eventType === 'TRANSFER' && flattenedData.fromAccount && flattenedData.toAccount) {
                const cypher = `
                  // 1. Tìm hoặc tạo Node Người Gửi
                  MERGE (sender:Account { id: $fromAccount })
                  
                  // 2. Tìm hoặc tạo Node Người Nhận
                  MERGE (receiver:Account { id: $toAccount })
                  
                  // 3. Vẽ mũi tên dòng tiền (Relationship)
                  MERGE (sender)-[t:TRANSFERRED { eventId: $eventId }]->(receiver)
                  ON CREATE SET t.amount = $amount, t.timestamp = $date
                `;

                await this.neo4jService.writeQuery(cypher, {
                  fromAccount: flattenedData.fromAccount,
                  toAccount: flattenedData.toAccount,
                  eventId: flattenedData.eventId,
                  amount: flattenedData.transactionAmount,
                  date: flattenedData.occurredAt.toISOString(),
                });
                
                this.logger.debug(`[Neo4j] Đã vẽ Graph Event ID: ${event.id}`);
              }

            // Đánh dấu thành công
            await tx.$executeRaw`
              UPDATE "OutboxEvent"
              SET "isAnalyticsProcessed" = true
              WHERE id = ${event.id};
            `;
          } catch (eventError) {
            // DEAD-LETTER QUEUE CHO DATA PIPELINE
            const newRetryCount = (event.retryCount || 0) + 1;
            const isNowFailed = newRetryCount >= 3;

            await tx.$executeRaw`
              UPDATE "OutboxEvent"
              SET "retryCount" = ${newRetryCount},
                  "isFailed" = ${isNowFailed}
              WHERE id = ${event.id};
            `;
            this.logger.error(`❌ [Pipeline Worker] Lỗi Flatten Data Event ID ${event.id}. Chuyển vào DLQ nếu >=3.`, eventError.stack);
          }
        }
        this.logger.log(`✅ [Pipeline Worker] Đã xử lý xong batch ${unprocessedEvents.length} events.`);
      });
    } catch (error) {
      this.logger.error('Lỗi Transaction khi quét OutboxEvent Pipeline', error.stack);
    }
  }
}