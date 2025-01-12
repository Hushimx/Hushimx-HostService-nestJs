import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { buildFilters } from 'src/utils/filters';
import { Permission, Role } from 'src/auth/role-permission-service/rolesData';
import {  paginateAndSort } from 'src/utils/pagination';
import { Client } from 'whatsapp-web.js';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService,private readonly rolePermissionService: RolePermissionService) {}
  create(createClientDto: CreateClientDto) {
    return 'This action adds a new client';
  }

  findAll(query: QueryClientDto, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_CLIENTS);
    const filters = buildFilters({ userRole, userCountryId, dto: query,allowedFields: ['phoneNo',"name"],
    });

    if(query.clientId) filters.clientId = query.clientId

    return paginateAndSort(
      this.prisma.client,
      { where: filters },
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
    );  }

  findOne(id: number) {
    return `This action returns a #${id} client`;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}
