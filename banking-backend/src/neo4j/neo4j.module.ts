import { Module, Global } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Global() // Đánh dấu Global để dùng chung toàn mạng
@Module({
  providers: [Neo4jService],
  exports: [Neo4jService], // <--- THIẾU DÒNG NÀY LÀ NESTJS SẼ BÁO LỖI Y NHƯ BẠN ĐANG GẶP
})
export class Neo4jModule {}
