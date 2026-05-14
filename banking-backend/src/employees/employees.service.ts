import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { userId, branchId, position, role } = createEmployeeDto;

    // 1. Kiểm tra User có tồn tại không
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản User này');

    // 2. Kiểm tra Chi nhánh có tồn tại và đang hoạt động không
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch || !branch.isActive) {
      throw new BadRequestException('Chi nhánh không tồn tại hoặc đã ngừng hoạt động');
    }

    // 3. Kiểm tra xem User này đã là nhân viên chưa (userId trong bảng Employee là @unique)
    const existingEmployee = await this.prisma.employee.findUnique({ where: { userId } });
    if (existingEmployee && existingEmployee.isActive) {
      throw new ConflictException('Tài khoản này hiện đã là nhân viên.');
    }

    // 4. THỰC THI TRANSACTION MỨC DATABASE
    return this.prisma.$transaction(async (tx) => {
      // Nếu đã từng làm nhân viên nhưng nghỉ việc (isActive: false), thì update lại.
      // Nếu chưa từng làm, thì create mới. Dùng upsert cho gọn.
      const employeeRecord = await tx.employee.upsert({
        where: { userId },
        update: {
          branchId,
          position,
          isActive: true,
          deletedAt: null, // Reset thời gian nghỉ việc
        },
        create: {
          userId,
          branchId,
          position,
        },
      });

      // Cập nhật Role cho User
      await tx.user.update({
        where: { id: userId },
        data: { role },
      });

      return employeeRecord;
    });
  }

  async findAll() {
    return this.prisma.employee.findMany({
      where: { isActive: true },
      include: {
        user: { select: { email: true, role: true } }, // Kéo theo email và role để báo cáo dễ đọc
        branch: { select: { name: true, code: true } } 
      }
    });
  }

  async softDelete(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Không tìm thấy hồ sơ nhân viên');

    // Lại dùng Transaction: Xóa nhân viên thì phải hạ Role của User xuống CUSTOMER
    return this.prisma.$transaction(async (tx) => {
      const removedEmployee = await tx.employee.update({
        where: { id },
        data: { 
          isActive: false, 
          deletedAt: new Date() 
        },
      });

      await tx.user.update({
        where: { id: employee.userId },
        data: { role: 'CUSTOMER' }, // Thu hồi quyền truy cập hệ thống nội bộ
      });

      return removedEmployee;
    });
  }
}