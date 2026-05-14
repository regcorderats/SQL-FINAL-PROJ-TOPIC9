import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';
import { PaginationDto } from '../common/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Khai báo độ phức tạp của thuật toán băm (saltRounds = 10 là chuẩn hiện nay)
    const { email, password: plainPassword, fullName, role } = createUserDto;

    // 1. Khai báo độ phức tạp của thuật toán băm (saltRounds = 10 là chuẩn hiện nay)
    const saltRounds = 10;

    // 2. Băm mật khẩu
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // 3. Lưu mật khẩu đã băm xuống Database (Tuyệt đối không lưu plainPassword)
    return await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || Role.CUSTOMER, 
        profile: {
          create: {
            fullName: fullName,
          },
        },
      },
    });
  }
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Chạy song song 2 query: lấy data và đếm tổng số record
    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // Sắp xếp mới nhất lên đầu
        include: {
          profile: true,
          accounts: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // Trả về data kèm theo thông tin Metadata chuẩn chỉ
    return {
      items: data,
      meta: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        accounts: true,
      },
    });
  }
  async validateUser(email: string, plainPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    // Dùng hàm compare của bcrypt để so sánh mật khẩu người dùng nhập với chuỗi băm trong DB
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (isMatch) {
      const { password, ...result } = user; // Xóa password khỏi object trả về
      return result;
    }
    return null;
  }
}