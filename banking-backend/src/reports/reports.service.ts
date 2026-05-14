import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DailyReportDto } from './dto/daily-report.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. FIX LỖI 1: Khôi phục lại hàm System Summary
  async getSystemSummary() {
    const [totalUsers, totalActiveAccounts, totalSystemBalance] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.account.count({ where: { status: 'ACTIVE' } }),
      this.prisma.account.aggregate({
        _sum: { balance: true, frozenBalance: true },
        where: { status: 'ACTIVE' }
      })
    ]);

    return {
      totalUsers,
      totalActiveAccounts,
      totalBalance: totalSystemBalance._sum.balance || 0,
      totalFrozenBalance: totalSystemBalance._sum.frozenBalance || 0,
    };
  }

  // 2. FIX LỖI 2: Đồng bộ type DailyReportDto và viết Dynamic Query
  async getDailyActivities(filter: DailyReportDto) {
    const { startDate, endDate, branchId } = filter;
    
    // Tạo mảng chứa các điều kiện lọc an toàn
    const conditions: Prisma.Sql[] = [];

    if (branchId) {
      conditions.push(Prisma.sql`"branchId" = ${branchId}`);
    }
    if (startDate) {
      conditions.push(Prisma.sql`"date" >= ${new Date(startDate)}`);
    }
    if (endDate) {
      conditions.push(Prisma.sql`"date" <= ${new Date(endDate)}`);
    }

    // Nếu có điều kiện, nối chúng lại bằng chữ ' AND ', nếu không thì để trống
    const whereClause = conditions.length > 0 
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` 
      : Prisma.empty;

    // Truy vấn trực tiếp vào Materialized View thay vì bảng Transaction
    return this.prisma.$queryRaw`
      SELECT * FROM mv_branch_daily_stats
      ${whereClause}
      ORDER BY "date" DESC, "branchId" ASC
      LIMIT 100;
    `;
  }
}