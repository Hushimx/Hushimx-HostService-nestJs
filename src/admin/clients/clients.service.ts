// clients.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/auth/role-permission-service/rolesData';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginateAndSort } from 'src/utils/pagination';
import { CreateClientDto, UpdateClientDto,  QueryClientDto } from './dto/clients.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async create(createClientDto: CreateClientDto, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.MANAGE_CLIENTS);

    const country = await this.prisma.country.findUnique({
      where: { id: createClientDto.countryId },
    });

    if (!country) {
      throw new NotFoundException('Country not found.');
    }

    try{
      const client = await this.prisma.client.create({
        data: {
          name: createClientDto.name,
          phoneNo: createClientDto.phoneNo,
          countryCode: country.code,
        },
      });
      return client;
    }catch (error) {
      if (error.code === 'P2002') { // Prisma's unique constraint error code
        throw new ConflictException(
         {
            code: 'CLIENT_ALREADY_EXISTS',
            message: 'A client with this phone number already exists.',
          }
        );
      }
      throw error; // Rethrow other unexpected errors
    }
  }

  async findAll(userRole: Role, userCountryId: number, query: QueryClientDto) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_CLIENTS);

    const filters: any = {};

    if (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_CLIENTS)) {
      filters.countryCode = (await this.prisma.country.findUnique({ where: { id: userCountryId } })).code;
    }

    if (query.name) {
      filters.name = { contains: query.name, mode: 'insensitive' };
    }

    const allowedSortFields = ['name', 'createdAt', 'updatedAt'];

    return paginateAndSort(
      this.prisma.client,
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

  async findOne(id: number, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_CLIENTS);

    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { country: true },
    });

    if (!client || (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_CLIENTS) && client.country.code !== (await this.prisma.country.findUnique({ where: { id: userCountryId } })).code)) {
      throw new NotFoundException('Client not found or access denied.');
    }

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.MANAGE_CLIENTS);

    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client || (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_CLIENTS) && client.countryCode !== (await this.prisma.country.findUnique({ where: { id: userCountryId } })).code)) {
      throw new NotFoundException('Client not found or access denied.');
    }

    try {
      const updatedClient = await this.prisma.client.update({
        where: { id },
        data: {
          name: updateClientDto.name,
          phoneNo: updateClientDto.phoneNo,
          countryCode: updateClientDto.countryId
            ? (await this.prisma.country.findUnique({ where: { id: updateClientDto.countryId } })).code
            : client.countryCode,
        },
      });
      return updatedClient;
    } catch (error) {
      if (error.code === 'P2002') { // Prisma's unique constraint error code
        throw new ConflictException(
         {
            code: 'CLIENT_ALREADY_EXISTS',
            message: 'A client with this phone number already exists.',
          }
        );
      }
      throw error; // Rethrow other unexpected errors
    }
  }

  async remove(id: number, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_CLIENTS);

    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client || (!this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_CLIENTS) && client.countryCode !== (await this.prisma.country.findUnique({ where: { id: userCountryId } })).code)) {
      throw new NotFoundException('Client not found or access denied.');
    }

    return this.prisma.client.delete({
      where: { id },
    });
  }
}
