// src/branches/dto/create-branch.dto.ts
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên chi nhánh không được để trống' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã chi nhánh là bắt buộc' })
  @MaxLength(20)
  code: string;

  @IsOptional()
  @IsString()
  location?: string;
}