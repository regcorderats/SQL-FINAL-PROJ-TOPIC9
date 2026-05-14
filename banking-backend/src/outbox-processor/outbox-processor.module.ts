import { Module } from '@nestjs/common';
import { OutboxProcessorService } from './outbox-processor.service';
import { PrismaModule } from '../prisma/prisma.module';
import { Neo4jModule } from '../neo4j/neo4j.module';
@Module({
  imports: [
    PrismaModule,
    Neo4jModule // <--- KÉO MODULE NEO4J VÀO ĐÂY
  ],
  providers: [OutboxProcessorService],
})
export class OutboxProcessorModule {}