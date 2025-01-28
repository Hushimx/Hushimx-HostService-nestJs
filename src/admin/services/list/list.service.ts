import { Injectable, NotFoundException,  ConflictException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-list.dto'
import { UpdateServiceDto } from './dto/update-list.dto';
import { QueryServiceDto } from './dto/query-list.dto';
import { PaginatedResult, paginateAndSort } from 'src/utils/pagination';
import { RolePermissionService } from 'src/admin/auth/role-permission-service/role-permission-service.service';
import { Permission,Role } from 'src/admin/auth/role-permission-service/rolesData';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { from } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ListService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}
  
  
  async findAll(query: QueryServiceDto, userRole: Role): Promise<PaginatedResult<any>> {
    // Enforce VIEW_SERVICES permission
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_SERVICES);

    const allowedSortFields = ['name', 'createdAt'];
    const filters = {};
    if(query.name) filters['name'] = { contains: query.name, mode: 'insensitive' };
    if(query.slug) filters['slug'] = { contains: query.slug, mode: 'insensitive' };
    return paginateAndSort(
      this.prisma.service,
      { where: filters },
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
      allowedSortFields,
    );
  }
  async findOne(slug: string, userRole: Role): Promise<any> {
    // Enforce VIEW_SERVICES permission
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_SERVICES);

    const service = await this.prisma.service.findUnique({ where: { slug } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }
  // Get a single service by slug
  async create(createServiceDto: CreateServiceDto, userRole: Role): Promise<any> {
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_SERVICES);
    if(createServiceDto.slug){
      createServiceDto.slug = createServiceDto.slug.toLowerCase().replace(' ', '-');
    }
    try {
      return await this.prisma.service.create({
        data: createServiceDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A service with this slug already exists.');
        }
      }
      throw error; // Rethrow unexpected errors
    }
  }

  // Update an existing service
  async update(slug: string, updateServiceDto: UpdateServiceDto, userRole: Role): Promise<any> {
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_SERVICES);

    const service = await this.prisma.service.findUnique({ where: { slug } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    try {
      return await this.prisma.service.update({
        where: { slug },
        data: updateServiceDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A service with this slug already exists.');
        }
      }
      throw error;
    }
  }
  // Delete a service
  async remove(slug: string, userRole: Role): Promise<any> {
    // Enforce DELETE_SERVICES permission
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_SERVICES);

    const service = await this.prisma.service.findUnique({ where: { slug } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service.delete({ where: { slug } });
  }

}
