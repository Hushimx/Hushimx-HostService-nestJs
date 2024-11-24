import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, EditAdminDto } from 'src/admin/dto/admin.dto';
import { GetUser } from 'src/auth/decorator';
import { ClientJwt } from 'src/auth/guard/clientJwt.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admins')
@Controller('admins')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  async getAdmins(@GetUser() user) {

    return this.adminService.getAdmins();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  async createAdmin(@Body() dto: CreateAdminDto, @GetUser() user) {
    return this.adminService.createAdmin(dto, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an existing admin' })
  async editAdmin(
    @Param('id') id: number,
    @Body() dto: EditAdminDto,
    @GetUser() user,
  ) {
    return this.adminService.editAdmin(id, dto, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin' })
  async deleteAdmin(@Param('id') id: number, @GetUser() user) {
    return this.adminService.deleteAdmin(id, user.role);
  }
}
