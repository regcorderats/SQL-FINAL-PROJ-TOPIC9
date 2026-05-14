import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Đánh dấu đây là module toàn cục
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export để các module khác có quyền sử dụng PrismaService
})
export class PrismaModule {}