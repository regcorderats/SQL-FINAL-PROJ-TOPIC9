import { Controller, Get, Param, Post, Body, Query, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../common/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }
  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    const user = await this.usersService.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
    
    // Tạm thời trả về thông tin user (Sau này học thêm bạn có thể bọc nó vào JWT Token)
    return {
      message: 'Đăng nhập hệ thống thành công',
      ...user
    };
  }
}
