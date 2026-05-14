import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Khởi tạo Adapter
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    // Truyền adapter xuống class cha (PrismaClient)
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('📦 Database connected successfully via Prisma');
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
