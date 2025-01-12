import { Injectable, NotFoundException } from '@nestjs/common';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/auth/role-permission-service/rolesData';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginateAndSort } from 'src/utils/pagination';
import { CreateCityDto, UpdateCityDto, QueryCityDto } from 'src/admin/dto/cities.dto';

@Injectable()
export class CitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async create(countryId: number, createCityDto: CreateCityDto, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_ADMINS);

    if (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_CITIES) && countryId !== userCountryId) {
      throw new NotFoundException('You do not have permission to create cities in this country.');
    }

    return this.prisma.city.create({
      data: { ...createCityDto, countryId },
    });
  }

  async findAll(
    paramCountryId: number,
    userRole: Role,
    userCountryId: number,
    query: QueryCityDto,
  ) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_CITIES);

    const filters: any = {};

    if (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_CITIES)) {
      filters.countryId = userCountryId;
    } else {
      if (paramCountryId) {
        filters.countryId = paramCountryId;
      }
    }

    if (query.name) {
      filters.name = { contains: query.name, mode: 'insensitive' };
    }

    const allowedSortFields = ['name', 'createdAt', 'updatedAt'];

    return paginateAndSort(
      this.prisma.city,
      {
        where: filters,
      },
      {
        page: query.page,
        limit: query.limit,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
      allowedSortFields,
    );
  }

  async findOne(countryId: number, id: number, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_CITIES);

    const city = await this.prisma.city.findUnique({
      where: { id },
      include: { country: true },
    });

    if (!city || (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_CITIES) && city.countryId !== userCountryId)) {
      throw new NotFoundException('City not found or access denied.');
    }

    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_CITIES);

    const city = await this.prisma.city.findUnique({
      where: { id },
    });

    if (!city || (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_CITIES) && city.countryId !== userCountryId)) {
      throw new NotFoundException('City not found or access denied.');
    }

    return this.prisma.city.update({
      where: { id },
      data: updateCityDto,
    });
  }

  async remove(id: number, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_CITIES);

    const city = await this.prisma.city.findUnique({
      where: { id },
    });

    if (!city || (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_CITIES) && city.countryId !== userCountryId)) {
      throw new NotFoundException('City not found or access denied.');
    }

    return this.prisma.city.delete({
      where: { id },
    });
  }
}
