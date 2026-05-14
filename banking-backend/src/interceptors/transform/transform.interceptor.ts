import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Định nghĩa form chuẩn cho toàn bộ API
export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    // next.handle() là lúc Controller xử lý xong và nhả dữ liệu ra
    return next.handle().pipe(
      map((data) => {
        // Tự động nhận diện nếu Controller muốn gửi message tùy chỉnh
        const message = data?.message || 'Xử lý thành công';
        
        // Loại bỏ trường message ra khỏi data để tránh lặp dữ liệu
        let responseData = data;
        if (data && typeof data === 'object' && !Array.isArray(data) && 'message' in data) {
          const { message: _, ...rest } = data;
          responseData = Object.keys(rest).length > 0 ? rest : null;
        }

        return {
          statusCode: response.statusCode,
          message: message,
          data: responseData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}