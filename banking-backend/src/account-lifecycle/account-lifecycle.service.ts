import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountLifecycleService {
  private readonly logger = new Logger(AccountLifecycleService.name);

  constructor(private prisma: PrismaService) {}

  // Chạy vào 1h sáng mỗi ngày
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDormantAccounts() {
    this.logger.log('Bắt đầu quét và chuyển đổi tài khoản sang DORMANT...');

    try {
      // Dùng Raw SQL để tối ưu hiệu năng: 
      // Cập nhật các tài khoản ACTIVE thành DORMANT nếu KHÔNG CÓ giao dịch nào liên quan trong 6 tháng qua.
      const result = await this.prisma.$executeRaw`
        UPDATE "Account"
        SET status = 'DORMANT'::"AccountStatus",
            "updatedAt" = NOW()
        WHERE status = 'ACTIVE'
        AND NOT EXISTS (
          SELECT 1 FROM "Transaction"
          WHERE ("fromAccountId" = "Account".id OR "toAccountId" = "Account".id)
          AND "createdAt" >= NOW() - INTERVAL '6 months'
        );
      `;

      this.logger.log(`Đã chuyển ${result} tài khoản sang trạng thái DORMANT.`);
    } catch (error) {
      this.logger.error('Lỗi khi chạy job ngủ đông tài khoản:', error);
    }
  }
  @Cron('59 23 * * *')
  async calculateOvernightInterest() {
    this.logger.log('Bắt đầu tính lãi qua đêm cho hệ thống...');

    try {
      // Gọi trực tiếp UDF dưới Postgres, trả về số dòng (tài khoản) đã được cộng lãi
      const updatedRows: any[] = await this.prisma.$queryRaw`
        SELECT calculate_daily_interest() AS updated_count;
      `;

      // Vì trả về mảng object, ta bóc tách data
      const count = updatedRows[0]?.updated_count || 0;
      this.logger.log(`Hoàn tất cộng lãi qua đêm. Số tài khoản được cộng lãi: ${count}`);
    } catch (error) {
      this.logger.error('Lỗi khi chạy UDF tính lãi suất:', error);
    }
  }
  @Cron('*/5 * * * *')
  async refreshPendingTransactionsView() {
    try {
      // Dùng CONCURRENTLY để không lock view trong lúc đang làm mới
      await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pending_transactions_summary;`;
      // Tắt log dòng này nếu không muốn console bị rác mỗi 5 phút
      // this.logger.debug('Đã làm mới Materialized View cho Dashboard.'); 
    } catch (error) {
      this.logger.error('Lỗi khi refresh Materialized View:', error);
    }
  }
}