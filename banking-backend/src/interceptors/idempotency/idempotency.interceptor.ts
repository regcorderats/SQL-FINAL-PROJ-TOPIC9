import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service'; // Đã sửa đường dẫn chuẩn theo ảnh

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // 1. Đọc key từ Header
    const idempotencyKey = request.headers['x-idempotency-key'];

    if (!idempotencyKey) {
      throw new HttpException(
        'Bắt buộc phải có header x-idempotency-key cho giao dịch này',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. Kiểm tra DB xem key này đã xử lý chưa
    const existingLog = await this.prisma.idempotencyLog.findUnique({
      where: { key: idempotencyKey as string },
    });

    if (existingLog) {
      this.logger.warn(`♻️ Trùng Idempotency Key: ${idempotencyKey}. Trả về kết quả cũ.`);
      response.status(existingLog.responseStatus);
      return of(existingLog.responseBody);
    }

    // 3. Nếu mới, cho đi tiếp và lưu kết quả sau khi xử lý xong
    return next.handle().pipe(
      tap(async (resBody) => {
        try {
          await this.prisma.idempotencyLog.create({
            data: {
              key: idempotencyKey as string,
              requestPath: request.url,
              responseBody: resBody || {}, 
              responseStatus: response.statusCode, 
            },
          });
        } catch (error) {
          this.logger.error('Không thể lưu Idempotency Log', error.stack);
        }
      }),
    );
  }
}