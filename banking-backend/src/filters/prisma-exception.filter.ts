// src/filters/prisma-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

// Decorator @Catch chỉ định rằng Filter này CHỈ rình và bắt các lỗi phát sinh từ Prisma
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Mặc định cứ cho là lỗi 500 (Internal Server Error)
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi hệ thống nội bộ. Vui lòng thử lại sau.';

    // Bắt đầu "bắt mạch" các mã lỗi đặc trưng của Prisma
    switch (exception.code) {
      case 'P2002': // Lỗi vi phạm Unique Constraint (ví dụ: tạo user bị trùng email)
        status = HttpStatus.CONFLICT; // Ép về lỗi 409 Conflict (Trùng đột)
        message = 'Dữ liệu đã tồn tại trong hệ thống. Vui lòng sử dụng thông tin khác.';
        break;
      
      case 'P2025': // Lỗi thao tác với record không tồn tại (ví dụ: update/delete user id bị sai)
        status = HttpStatus.NOT_FOUND; // Ép về lỗi 404 Not Found
        message = 'Không tìm thấy dữ liệu yêu cầu.';
        break;
        
      // Bạn có thể thêm case 'P2003' cho lỗi khóa ngoại (Foreign key constraint) nếu muốn
    }

    // Trả về JSON theo đúng chuẩn TransformInterceptor mà bạn đã quy định
    response.status(status).json({
      statusCode: status,
      message: message,
      data: null, // Đã lỗi thì không có data
      timestamp: new Date().toISOString(),
    });
  }
}