import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards, ForbiddenException, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, EditAdminDto, GetAdminsQueryDto } from 'src/admin/dto/admin.dto';
import { GetUser } from 'src/auth/decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdminJwt } from 'src/auth/guard';
import { DefaultApiErrors } from '../decorator';
import { Admin } from 'types/admin';

@ApiTags('Admins')
@Controller('admin/admins')
@ApiBearerAuth()
@UseGuards(AdminJwt)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all admins with pagination and sorting' })
  @ApiResponse({
    status: 200,
    description: 'List of admins retrieved successfully.',
    schema: {
      example: {
        items: [
          {
            id: 1,
            email: 'admin@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'REGIONAL_ADMIN',
            countryId: 5,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing authentication token.' })
  @ApiResponse({ status: 400, description: 'Email already exists.' })
  @DefaultApiErrors()
  async getAdmins(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: GetAdminsQueryDto,
    @GetUser() user: Admin,
  ) {
    return this.adminService.getAdmins(query,user.role,user.countryId);
  }


  @Get(":id")
  @ApiOperation({ summary: 'Get all admins with pagination and sorting' })
  @ApiResponse({
    status: 200,
    description: 'List of admins retrieved successfully.',
    schema: {
      example: {
        items:
          {
            id: 1,
            email: 'admin@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'REGIONAL_ADMIN',
            countryId: 5,

      },
    },
  }})
  @DefaultApiErrors()
  @ApiResponse({ status: 403, description: 'Email already exists.' })
  async getAdmin(
    @Param("id",ParseIntPipe) id,
    @GetUser() user,
  ) {
    return this.adminService.getAdmin(id,user.role);
  }


  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully.',
    schema: {
      example: {
        id: 1,
        email: 'admin@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'REGIONAL_ADMIN',
        countryId: 5,
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden. You don\'t have access to this route.' })

  async createAdmin(@Body(new ValidationPipe({ transform: true, whitelist: true })) dto: CreateAdminDto, @GetUser() user) {
    return this.adminService.createAdmin(dto, user.role, user.countryId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an existing admin' })
  @ApiResponse({
    status: 200,
    description: 'Admin updated successfully.',
    schema: {
      example: {
        id: 1,
        email: 'admin@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'REGIONAL_ADMIN',
        countryId: 5,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You don\'t have access to this route.' })

  async editAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: EditAdminDto,
    @GetUser() user,
  ) {
    return this.adminService.editAdmin(id, dto, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin' })
  @ApiResponse({
    status: 200,
    description: 'Admin deleted successfully.',
    schema: {
      example: { message: 'Admin with email admin@example.com has been deleted.' },
    },
  })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You don\'t have access to this route.' })

  async deleteAdmin(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.adminService.deleteAdmin(id, user.role);
  }
}
