// src/branches/branches.service.ts
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    // PrismaExceptionFilter của bạn có thể đã bắt lỗi Unique (P2002) cho trường 'code',
    // nhưng check trước ở đây cũng là một lớp bảo vệ tốt.
    const existingBranch = await this.prisma.branch.findUnique({
      where: { code: createBranchDto.code },
    });

    if (existingBranch) {
      throw new ConflictException(`Chi nhánh với mã ${createBranchDto.code} đã tồn tại.`);
    }

    return this.prisma.branch.create({
      data: createBranchDto,
    });
  }

  async findAll() {
    return this.prisma.branch.findMany({
      where: { isActive: true }, // Mặc định chỉ lấy chi nhánh đang hoạt động
      include: {
        _count: {
          select: { employees: { where: { isActive: true } } } // Đếm số nhân sự hiện tại
        }
      }
    });
  }

  async softDelete(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        employees: { where: { isActive: true } }
      }
    });

    if (!branch) {
      throw new NotFoundException('Không tìm thấy chi nhánh');
    }

    // RÀNG BUỘC DBMS: Không cho phép xóa chi nhánh nếu vẫn còn nhân sự đang hoạt động
    if (branch.employees.length > 0) {
      throw new BadRequestException('Không thể đóng cửa chi nhánh đang có nhân sự. Vui lòng thuyên chuyển nhân sự trước.');
    }

    return this.prisma.branch.update({
      where: { id },
      data: { 
        isActive: false,
        deletedAt: new Date()
      },
    });
  }
}