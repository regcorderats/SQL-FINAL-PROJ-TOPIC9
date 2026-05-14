import { IsDateString, IsOptional, IsString } from 'class-validator';

export class DailyReportDto {
  @IsOptional()
  @IsDateString({}, { message: 'startDate phải là chuỗi ngày tháng ISO (VD: 2026-05-01)' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate phải là chuỗi ngày tháng ISO (VD: 2026-05-31)' })
  endDate?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}