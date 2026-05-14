import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client'; // 1. Import Role Enum từ Prisma

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng. VD: user@gmail.com' })
  email: string;

  @IsNotEmpty({ message: 'Tên đầy đủ không được để trống' })
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tên phải có ít nhất 3 ký tự' })
  fullName: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự bảo mật' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role không hợp lệ. Hệ thống chỉ chấp nhận USER hoặc ADMIN' }) // 2. Ràng buộc đầu vào phải là Enum
  role?: Role; // 3. Đổi kiểu dữ liệu từ string sang Role
}