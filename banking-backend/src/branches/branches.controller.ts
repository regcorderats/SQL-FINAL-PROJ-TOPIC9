// src/branches/branches.controller.ts
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  // TODO: Add @Roles(Role.MANAGER, Role.AUDITOR) + @UseGuards(...) sau
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  findAll() {
    return this.branchesService.findAll();
  }

  @Delete(':id')
  // TODO: Add Role Guards
  remove(@Param('id') id: string) {
    return this.branchesService.softDelete(id);
  }
}