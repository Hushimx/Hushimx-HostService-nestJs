import { Injectable } from '@nestjs/common';
import { RolePermissionService } from '../../auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/auth/role-permission-service/rolesData';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class CountriesService {
  constructor(private rolePermissionService: RolePermissionService, private prisma: PrismaService) {}

  // create(createCountryDto: CreateCountryDto) {



  //   return 'This action adds a new country';
  // }


  findAll(useRole) {
    this.rolePermissionService.enforcePermission(useRole, Permission.ACCESS_ALL_HOTELS);
    const hotels = this.prisma.country.findMany();
    return hotels;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} country`;
  // }

  // update(id: number, updateCountryDto: UpdateCountryDto) {
  //   return `This action updates a #${id} country`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} country`;
  // }
}
