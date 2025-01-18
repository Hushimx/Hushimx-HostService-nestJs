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
export class ServicesService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}
  


  async findAll(query: QueryCityServiceDto, user) {
    const filters: any = { vendorId: user.id,cityId:user.cityId };

    if(query.serviceId){
      filters.serviceId = query.serviceId
    } 

    return paginateAndSort(
      this.prisma.cityServiceVendor,
      { where: filters,select:{
        id:true,
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

  async findOne( id: number, user) {

    const CityService = await this.prisma.cityServiceVendor.findUnique({ where: { id,vendorId:user.id,cityId:user.cityId } });
    if (!CityService) {
      throw new NotFoundException({
        code:"CITY_SERVICE_NOT_FOUND",
        message:"Coudln't find and City Registerd for this service"
      });
    }

    return CityService;
  }

  async update( id: number, dto: UpdateCityServiceDto, user) {

 

    const CityService = await this.prisma.cityServiceVendor.findUnique({ where: { id,vendorId:user.id,cityId:user.cityId } });
    if (!CityService) {
      throw new NotFoundException({
        code:"CITY_SERVICE_NOT_FOUND",
        message:"Coudln't find and City Registerd for this service"
      });
    }

    try {
      const CityServiceRecord = await this.prisma.cityServiceVendor.update({
        where: { id },
        data: dto
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

}
