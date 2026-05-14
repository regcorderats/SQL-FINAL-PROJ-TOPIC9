import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './interceptors/transform/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các field không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu user cố tình gửi field lạ (chống NoSQL/SQL Injection)
      transform: true, // Tự động ép kiểu (VD: string '1' ở query thành number 1)
    }),
  );
  // 1. Bật CORS cho phép Frontend (đang chạy cổng 3000) gọi API
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // 2. Ưu tiên chạy cổng 3001 để nhường cổng 3000 cho Next.js
  await app.listen(process.env.PORT ?? 3001);
  console.log('🚀 Backend Core Banking đang chạy tại: http://localhost:3001');
}
bootstrap();