// src/common/dto/pagination.dto.ts
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number) // Ép kiểu query param (string) thành number
  @IsInt()
  @Min(1)
  page?: number = 1; // Mặc định là trang 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10; // Mặc định mỗi trang 10 record
}