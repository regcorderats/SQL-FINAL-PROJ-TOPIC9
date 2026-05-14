import { Module } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';
import { ReconciliationController } from './reconciliation.controller';
import { PrismaModule } from '../prisma/prisma.module'; // <-- Thêm dòng này (đường dẫn tùy cấu trúc của bạn)

@Module({
  imports: [PrismaModule], // <-- Inject PrismaModule vào
  providers: [ReconciliationService],
  controllers: [ReconciliationController]
})
export class ReconciliationModule {}