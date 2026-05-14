import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: Driver;
  private readonly logger = new Logger(Neo4jService.name);

  onModuleInit() {
    // Thay thế bằng URI và thông tin đăng nhập Neo4j của bạn (Docker hoặc AuraDB)
    this.driver = neo4j.driver(
      'bolt://localhost:7687', 
      neo4j.auth.basic('neo4j', 'password')
    );
    this.logger.log('✅ Đã kết nối Neo4j Database');
  }

  onModuleDestroy() {
    this.driver.close();
  }

  // Hàm thực thi Cypher Query
  async writeQuery(cypher: string, params?: any) {
    const session = this.driver.session();
    try {
      // Đổi writeTransaction thành executeWrite
      const result = await session.executeWrite((tx) => tx.run(cypher, params));
      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi ghi data vào Neo4j: ${error.message}`);
      throw error;
    } finally {
      await session.close();
    }
  }
}