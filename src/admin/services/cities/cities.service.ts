import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { paginateAndSort } from 'src/utils/pagination';
import { Permission,Role } from 'src/admin/auth/role-permission-service/rolesData';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { buildFilters } from 'src/utils/filters';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolePermissionService } from 'src/admin/auth/role-permission-service/role-permission-service.service';
import { CreateCityServiceDto } from './dto/create-city.dto';
import { QueryCityServiceDto } from './dto/query-city.dto';
import { UpdateCityServiceDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}
  
  async create(dto: CreateCityServiceDto, userRole: Role,userCountryId) {
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_VENDORS);

    const service = await this.prisma.service.findUnique({ where: { id:dto.serviceId } });
    if (!service) {
      throw new NotFoundException({
        code:"SERVICE_NOT_FOUND",
        message: "Couldn't find Service"
      });
    }
    const city = await this.prisma.city.findUnique({
      where: { id: dto.cityId },
      select: { countryId: true },
    });

    if (!city) {
      throw new NotFoundException({code:"CITY_NOT_FOUND",message:"City not found"});
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.CREATE_VENDORS,
      userCountryId,
      city.countryId,
    );


    try {
      const CityService = await this.prisma.cityServiceVendor.create({
        data: {
          serviceId: service.id,
          vendorId: dto.vendorId,
          address: dto.address,
          locationUrl: dto.locationUrl ? dto.locationUrl : undefined,
          cityId: dto.cityId,
          description: dto.description,
          description_ar: dto.description_ar,
        },
      });
      return CityService
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({
          code:"CITY_CONFLICT",
          message:"This city Already Registed for this Service"
        });
      }

      throw error;
    }
  }

  async findAll(query: QueryCityServiceDto, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_VENDORS);

    const filters = buildFilters({userRole,
      userCountryId,
      dto:query,
    });

    if(query.vendorId){
      filters.vendorId = query.vendorId
    } 
    if(query.serviceId){
      filters.serviceId = query.serviceId
    } 

    return paginateAndSort(
      this.prisma.cityServiceVendor,
      { where: filters,select:{
        id:true,
        vendor: {
          select: {
            name: true,
          }
        },
        city : {
          select: {
            name: true,
          }

      },
      service: {
        select: {
          name: true,
        }
      }
      } },
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
    );
  }

  async findOne( id: number, userRole: Role,userCountryId) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_VENDORS);

    const CityService = await this.prisma.cityServiceVendor.findUnique({ where: { id },include:{city: { select : { countryId:true }}} });
    if (!CityService) {
      throw new NotFoundException({
        code:"CITY_SERVICE_NOT_FOUND",
        message:"Coudln't find and City Registerd for this service"
      });
    }
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.DELETE_VENDORS,
      userCountryId,
      CityService.city.countryId,
    );
    return CityService;
  }

  async update( id: number, dto: UpdateCityServiceDto, userRole: Role,userCountryId) {
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_VENDORS);

 

    const CityService = await this.prisma.cityServiceVendor.findUnique({ where: { id },include:{city: { select : { countryId:true }}} });
    if (!CityService) {
      throw new NotFoundException({
        code:"CITY_SERVICE_NOT_FOUND",
        message:"Coudln't find and City Registerd for this service"
      });
    }
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.DELETE_VENDORS,
      userCountryId,
      CityService.city.countryId,
    );
    try {
      const CityServiceRecord = await this.prisma.cityServiceVendor.update({
        where: { id },
        data: dto,
      });
      return CityServiceRecord;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({
          code:"CITY_CONFLICT",
          message:"This city Already Registed for this Service"
        });
      }
      throw error;
    }
  }

  async delete(id: number, userRole: Role,userCountryId) {
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_VENDORS);
  

    const CityService = await this.prisma.cityServiceVendor.findUnique({ where: { id },include: {
      city: {
        select: {countryId:true}
      }
    } });
    if (!CityService) {
      throw new NotFoundException({
        code:"CITY_SERVICE_NOT_FOUND",
        message:"Coudln't find and City Registerd for this service"
      });
       }

    // Enforce country-specific access
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.DELETE_VENDORS,
      userCountryId,
      CityService.city.countryId,
    );
    return this.prisma.cityServiceVendor.delete({ where: { id } });
  }

}
