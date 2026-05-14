import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()

export class OutboxService {
  // Khởi tạo Logger để in ra terminal cho đẹp
  private readonly logger = new Logger(OutboxService.name);

  constructor(private prisma: PrismaService) {}

  // Cứ mỗi 10 giây hàm này sẽ tự động được gọi 1 lần
  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutboxEvents() {
    try {
      // Dùng Transaction để đảm bảo tính ACID khi update trạng thái
      await this.prisma.$transaction(async (tx) => {
        // 1. DÙNG RAW SQL + SKIP LOCKED ĐỂ TÌM VÀ KHÓA EVENT
        const events: any[] = await tx.$queryRaw`
          SELECT id, "payload", "eventType", "retryCount" 
          FROM "OutboxEvent"
          WHERE "isProcessed" = false AND "isFailed" = false
          ORDER BY "createdAt" ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED;
        `;

        // Nếu không có event nào thì thoát ra, đợi 10 giây sau quét tiếp
        if (!events || events.length === 0) {
          return; 
        }

        const event = events[0];
        this.logger.log(`🔄 Tìm thấy Event [${event.eventType}] ID: ${event.id}`);
        this.logger.verbose(`📦 Payload: ${JSON.stringify(event.payload)}`);
        try {
          // 2. NƠI XỬ LÝ LOGIC CORE BANKING (Giả lập 1s)
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // 3. THÀNH CÔNG: ĐÁNH DẤU LÀ ĐÃ XỬ LÝ
          await tx.$executeRaw`
            UPDATE "OutboxEvent"
            SET "isProcessed" = true
            WHERE id = ${event.id};
          `;
          this.logger.log(`✅ Đã xử lý thành công Event ID: ${event.id}`);
        } catch (logicError) {
          // XỬ LÝ DEAD-LETTER QUEUE NẾU LOGIC LỖI
          const newRetryCount = (event.retryCount || 0) + 1;
          const isNowFailed = newRetryCount >= 3;

          await tx.$executeRaw`
            UPDATE "OutboxEvent"
            SET "retryCount" = ${newRetryCount},
                "isFailed" = ${isNowFailed}
            WHERE id = ${event.id};
          `;
          this.logger.warn(`⚠️ [Core Worker] Event ${event.id} lỗi lần ${newRetryCount}. Failed state: ${isNowFailed}`);
        }
      });
    } catch (error) {
      this.logger.error('❌ Lỗi hệ thống khi quét OutboxEvent', error.stack);
    }
  }
}