import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { OutboxModule } from './outbox/outbox.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { OutboxProcessorModule } from './outbox-processor/outbox-processor.module';
import { AccountLifecycleModule } from './account-lifecycle/account-lifecycle.module';
import { BranchesModule } from './branches/branches.module';
import { EmployeesModule } from './employees/employees.module';
import { ReportsModule } from './reports/reports.module';
import { Neo4jModule } from './neo4j/neo4j.module';

@Module({
  imports: [
    // Gắn cờ isGlobal: true để dùng Universal toàn project
    ConfigModule.forRoot({ isGlobal: true }), 
    UsersModule,
    ScheduleModule.forRoot(),
    TransactionsModule,
    PrismaModule,
    OutboxModule,
    ReconciliationModule,
    OutboxProcessorModule,
    AccountLifecycleModule,
    BranchesModule,
    EmployeesModule,
    ReportsModule,
    Neo4jModule,
  ],
})
export class AppModule {}
