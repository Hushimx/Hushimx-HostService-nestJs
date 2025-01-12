import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto, EditAdminDto, GetAdminsQueryDto } from 'src/admin/dto/admin.dto';
import * as argon2 from 'argon2';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';
import { paginateAndSort, PaginateAndSortOptions } from 'src/utils/pagination';
import { Role, Permission } from 'src/auth/role-permission-service/rolesData';
import { buildFilters } from 'src/utils/filters';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  // Fetch all admins with pagination and sorting
  async getAdmins(
    dto: GetAdminsQueryDto = {},
    userRole: Role,
    userCountryId: number
  ): Promise<any> {
    // Enforce permission
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_ADMINS);

    const allowedSortFields = ['id', 'email', 'name', 'role', 'countryId'];

    const filters: any = {};

    // Filter by name or email if provided
    if (dto.name) {
      filters.name = { contains: dto.name, mode: 'insensitive' }; // Case-insensitive search
    }
    if (dto.email) {
      filters.email = { contains: dto.email, mode: 'insensitive' }; // Case-insensitive search
    }
  
    // Filter by role if provided
    if (dto.role) {
      filters.role = dto.role;
    }
  
    // RBAC logic for country filtering
    if (userRole === Role.SUPER_ADMIN) {
      // SUPER_ADMIN can filter by country if specified
      if (dto.country) {
        filters.countryId = dto.country;
      }
    } else  {
      // REGIONAL_ADMIN is restricted to their assigned country
      filters.countryId = userCountryId;
    }
    return paginateAndSort(
      this.prisma.admin,
      {
        where: filters, // Apply dynamic filters
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          countryId: true,
          country: {
            select: {
              name: true,
            },
          },
        },
      },
      {
        page: dto.page,
        limit: dto.limit,
        sortField: dto.sortField,
        sortOrder: dto.sortOrder,
      },
      allowedSortFields,
    );
  }
  
  // Create a new admin
  async createAdmin(dto: CreateAdminDto, userRole: Role,userCountryId:number) {
    // Enforce permission
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_ADMINS);

    const { email, password, name,  role, countryId } = dto;

    // Validate REGIONAL_ADMIN requires a countryId
    if (role === Role.REGIONAL_ADMIN && !countryId) {
      throw new BadRequestException('Country ID is required for REGIONAL_ADMIN.');
    }
   const isEmailUnique = await this.prisma.admin.findUnique({ where: { email } });
    if (isEmailUnique) {
      throw new BadRequestException('Email already exists.');
    }


    const hashedPassword = await argon2.hash(password);

    return this.prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name : name,
        role,
        countryId: role === Role.REGIONAL_ADMIN ? countryId : userCountryId,
      },
      select: { id: true, email: true,name:true, role: true, countryId: true },
    });
  }
async getAdmin(adminId: number, userRole: Role) {
    // Enforce permission
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_ADMINS);
  
    // Check if the admin exists
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId },select: { id: true, email: true, name: true, role: true,countryId:true } });
    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }
  
    return admin;
  }
  // Edit an existing admin
  async editAdmin(adminId: number, dto: EditAdminDto & { hash?: string }, userRole: Role) {
    // Enforce permission
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_ADMINS);
  
    // Check if the admin exists
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }
    // Hash the password if it's provided
    if (dto.password) {
      dto.hash = await argon2.hash(dto.password);
      delete dto.password
    }
  
    // Build the update data by excluding undefined values
    const updateData = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined)
    );
  
    // Update the admin in the database
    return this.prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, countryId: true },
    });
  }
  
  // Delete an admin
  async deleteAdmin(adminId: number, userRole: Role) {
    // Enforce permission
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_ADMINS);

    const admin = await this.prisma.admin.findUnique({ where: { id: adminId }, select: { email: true } });
    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    await this.prisma.admin.delete({ where: { id: adminId } });

    return { message: `Admin with email ${admin.email} has been deleted.` };
  }
}
