import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/auth/role-permission-service/rolesData';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginateAndSort } from 'src/utils/pagination';
import { CreateCityDto, UpdateCityDto, QueryCityDto } from 'src/admin/dto/cities.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async create(countryId: number, createCityDto: CreateCityDto, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_ADMINS);

    if (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_CITIES) && countryId !== userCountryId) {
      throw new ForbiddenException('You do not have permission to create cities in this country.');
    }
    
    console.log("111")


    try {
      const createdClient = await this.prisma.city.create({
        data: { ...createCityDto, countryId },
      });
      return createdClient
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({
          code: 'CITY_ALREADY_EXISTS',
          message: 'A city with this name already exists in this country.',
        });
      }else{
              throw error;

      }
    }
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
      where: { id,countryId },
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

    try {
      const city = await this.prisma.city.update({
        where: { id },
        data: updateCityDto,
      });
      return city
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException({
          code: 'CITY_ALREADY_EXISTS',
          message: 'A city with this name already exists in this country.',
        });      }
      throw error;
    }
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
