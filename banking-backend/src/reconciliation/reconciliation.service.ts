import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('59 23 * * *') 
  async performDailyReconciliation() {
    this.logger.log('Bắt đầu tiến trình Đối soát cuối ngày (Daily Reconciliation)...');

    try {
      await this.prisma.$transaction(async (tx) => {
        // ==========================================
        // 1. QUÉT & TỰ ĐỘNG HOÀN TIÊN GIAO DỊCH KẸT
        // ==========================================
        // Dùng Raw SQL để vừa tìm vừa khóa dòng an toàn
        const orphanedTransactions: any[] = await tx.$queryRaw`
          SELECT id, amount, "fromAccountId"
          FROM "Transaction"
          WHERE status = 'PENDING' 
            AND "createdAt" < NOW() - INTERVAL '24 hours'
          FOR UPDATE SKIP LOCKED;
        `;

        if (orphanedTransactions.length > 0) {
          this.logger.warn(`[ALERT] Phát hiện ${orphanedTransactions.length} giao dịch kẹt ở PENDING quá 24h. Bắt đầu hoàn tiền...`);
          console.table(orphanedTransactions); 

          for (const txRecord of orphanedTransactions) {
            if (!txRecord.fromAccountId) continue;

            // Đổi trạng thái giao dịch thành FAILED
            await tx.$executeRaw`
              UPDATE "Transaction"
              SET status = 'FAILED'
              WHERE id = ${txRecord.id};
            `;

            // Rút tiền khỏi frozenBalance và trả lại vào balance
            await tx.$executeRaw`
              UPDATE "Account"
              SET "frozenBalance" = "frozenBalance" - ${txRecord.amount},
                  "balance" = "balance" + ${txRecord.amount}
              WHERE id = ${txRecord.fromAccountId};
            `;
            
            this.logger.log(`💵 Đã tự động hoàn ${txRecord.amount} về tài khoản ${txRecord.fromAccountId}`);
          }
        } else {
          this.logger.log('[OK] Không có giao dịch PENDING nào bị kẹt.');
        }

        // ==========================================
        // 2. QUÉT OUTBOX EVENT KẸT (Data Pipeline/Core)
        // ==========================================
        // Quét những event kẹt cứng (Failed) hoặc bị bỏ quên chưa ai xử lý
        const orphanedOutboxEvents = await tx.$queryRaw`
          SELECT id, "aggregateId", "eventType"
          FROM "OutboxEvent"
          WHERE ("isProcessed" = false OR "isAnalyticsProcessed" = false OR "isFailed" = true)
            AND "createdAt" < NOW() - INTERVAL '24 hours'
          LIMIT 50;
        `;

        // Ở đây biến trả về từ $queryRaw có thể coi là array, ta check length:
        if (Array.isArray(orphanedOutboxEvents) && orphanedOutboxEvents.length > 0) {
          this.logger.error(`[CRITICAL ALERT] Phát hiện ${orphanedOutboxEvents.length} OutboxEvent kẹt hoặc Failed! IT cần kiểm tra gấp.`);
          console.table(orphanedOutboxEvents);
        } else {
          this.logger.log('[OK] Không có OutboxEvent nào kẹt. Pipeline mượt mà.');
        }

      });

      this.logger.log('✅ Hoàn tất tiến trình Đối soát cuối ngày.');

    } catch (error) {
      this.logger.error('❌ Lỗi nghiêm trọng trong quá trình chạy Cronjob Đối soát', error.stack);
    }
  }

  // Cực kỳ hữu ích để gọi qua Controller lúc bảo vệ đồ án
  async triggerManualReconciliation() {
    await this.performDailyReconciliation();
    return { message: 'Đã kích hoạt tiến trình đối soát tự động hoàn tiền.' };
  }
}