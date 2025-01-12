import { Injectable } from '@nestjs/common';
import { RolePermissionService, } from 'src/auth/role-permission-service/role-permission-service.service';
import { Permission,Role } from 'src/auth/role-permission-service/rolesData';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginateAndSort } from 'src/utils/pagination';
import { FindAllCitiesDto } from 'src/admin/dto/cities.dto'; // Uncomment if needed

@Injectable()
export class CitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private rolePermissionService: RolePermissionService,
  ) {}

  // create(createCityDto: CreateCityDto) {
  //   return this.prisma.city.create({ data: createCityDto });
  // }

  async findAll(
    paramCountryId: number,
    userRole: Role,
    userCountryId: number,
    query : FindAllCitiesDto
  ) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_HOTELS);

    const filters: any = {};

    if (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_HOTELS)) {
      filters.countryId = userCountryId;
    }else{
      if (paramCountryId) {
        filters.countryId = paramCountryId;
      }
    }


    if (query.name) {
      filters.name = { contains: query.name, mode: 'insensitive' };
    }

    const allowedSortFields = ['name', 'createdAt', 'updatedAt'];

    return this.prisma.city.findMany({
      where: filters,
    })
  }
}

//   async findOne(id: number) {
//     return this.prisma.city.findUnique({
//       where: { id },
//       include: { country: true },
//     });
//   }

//   async update(id: number, updateCityDto: UpdateCityDto) {
//     return this.prisma.city.update({
//       where: { id },
//       data: updateCityDto,
//     });
//   }

//   async remove(id: number) {
//     return this.prisma.city.delete({ where: { id } });
//   }
// }
