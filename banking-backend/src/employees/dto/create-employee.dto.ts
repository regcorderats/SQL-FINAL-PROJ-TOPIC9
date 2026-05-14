import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client'; // Import Enum từ Prisma

export class CreateEmployeeDto {
  @IsUUID('4', { message: 'userId phải là một UUID hợp lệ' })
  @IsNotEmpty()
  userId: string;

  @IsUUID('4', { message: 'branchId phải là một UUID hợp lệ' })
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty({ message: 'Vị trí/Chức vụ không được để trống' })
  position: string;

  @IsEnum(Role, { message: 'Role không hợp lệ (TELLER, MANAGER, AUDITOR)' })
  @IsOptional()
  role?: Role = Role.TELLER; // Mặc định gán là TELLER nếu không truyền
}