import { Injectable, Logger } from '@nestjs/common';
   import { Cron, CronExpression } from '@nestjs/schedule';
   import { PrismaService } from '../prisma/prisma.service';

   @Injectable()
   export class ReportsCronService {
     private readonly logger = new Logger(ReportsCronService.name);

     constructor(private readonly prisma: PrismaService) {}

     // Chạy vào lúc 00:01 mỗi ngày
     // Dùng CronExpression.EVERY_MINUTE nếu bạn muốn test thử ngay lập tức
     @Cron('1 0 * * *') 
     async refreshBranchDailyStats() {
       this.logger.log('Bắt đầu chốt sổ EOD: Refreshing Materialized View...');
       
       try {
         // Chú ý chữ CONCURRENTLY: Nó giúp PostgreSQL cập nhật data ngầm
         // mà KHÔNG KHÓA BẢNG. API vẫn có thể đọc data cũ trong lúc đang tính toán data mới.
         await this.prisma.$executeRawUnsafe(
           `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_branch_daily_stats;`
         );
         this.logger.log('Chốt sổ EOD thành công!');
       } catch (error) {
         this.logger.error('Lỗi khi chốt sổ EOD:', error);
       }
     }
   }