import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDriverDto, UpdateDriverDto, QueryDriverDto } from '../dto/driver.dto';
import { buildFilters } from 'src/utils/filters';
import { paginateAndSort, PaginatedResult } from 'src/utils/pagination';
import { RolePermissionService } from 'src/admin/auth/role-permission-service/role-permission-service.service';
import { Role, Permission } from 'src/admin/auth/role-permission-service/rolesData';
import { WwebjsService } from 'src/wwebjs/wwebjs.service';

@Injectable()
export class DriversService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly wwebjsService: WwebjsService
  ) {}

  // Create a new driver
  async create(
    createDriverDto: CreateDriverDto,
    userRole: Role,
    userCountryId?: number,
  ) {
    // Enforce permission
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_DRIVERS);

    // Validate the city and enforce country-specific access
    const city = await this.prisma.city.findUnique({
      where: { id: createDriverDto.cityId },
      select: { countryId: true },
    });

    if (!city) {
      throw new NotFoundException('City not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.CREATE_DRIVERS,
      userCountryId,
      city.countryId,
    );
    try {
      const isValid = await this.wwebjsService.checkForNumber(createDriverDto.phoneNo);
      if (!isValid) {
        throw new BadRequestException({
          code: "INVALID_WHATSAPP_NUMBER",
          message: 'Phone number is not valid',
        });
    
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        code: "WHATSAPP_ERROR",
        message: 'WhatsApp bots doesn\'t work',
      });
    }

    // Create the driver
    return this.prisma.driver.create({
      data: {
        name: createDriverDto.name,
        phoneNo: createDriverDto.phoneNo,
        cityId: createDriverDto.cityId,
      },
      select: {
        id: true,
        name: true,
        phoneNo: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Find all drivers with filtering, sorting, and pagination
  async findAll(
    query: QueryDriverDto,
    userRole: Role,
    userCountryId?: number,
  ): Promise<PaginatedResult<any>> {
    // Enforce permission
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_DRIVERS);

    // Build filters
    const filters = buildFilters({
      userRole,
      userCountryId,
      dto: query,
      allowedFields: ['name', 'phoneNo'],
    });

    return paginateAndSort(
      this.prisma.driver,
      {
        where: filters,
        select: {
          id: true,
          name: true,
          phoneNo: true,
          city: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
      ['name', 'phoneNo', 'createdAt', 'city.name'],
    );
  }

  // Find a single driver by ID
  async findOne(id: number, userRole: Role, userCountryId?: number) {
    // Enforce permission
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_DRIVERS);

    // Fetch the driver
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phoneNo: true,
        city: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Enforce country-specific access
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.VIEW_DRIVERS,
      userCountryId,
      driver.city.country.id,
    );

    return driver;
  }

  // Update a driver
  async update(
    id: number,
    updateDriverDto: UpdateDriverDto,
    userRole: Role,
    userCountryId?: number,
  ) {
    // Enforce permission
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_DRIVERS);

    // Check if the driver exists
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      select: { city: { select: { countryId: true } } },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Enforce country-specific access
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.EDIT_DRIVERS,
      userCountryId,
      driver.city.countryId,
    );

    try {
      const isValid = await this.wwebjsService.checkForNumber(updateDriverDto.phoneNo);
      if (!isValid) {
        throw new BadRequestException({
          code: "INVALID_WHATSAPP_NUMBER",
          message: 'Phone number is not valid',
        });
    
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        code: "WHATSAPP_ERROR",
        message: 'WhatsApp bots doesn\'t work',
      });
    }


    // Update the driver
    return this.prisma.driver.update({
      where: { id },
      data: {
        ...updateDriverDto,
      },
      select: {
        id: true,
        name: true,
        phoneNo: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Remove a driver
  async remove(id: number, userRole: Role, userCountryId?: number) {
    // Enforce permission
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_DRIVERS);

    // Check if the driver exists
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      select: { city: { select: { countryId: true } } },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Enforce country-specific access
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.DELETE_DRIVERS,
      userCountryId,
      driver.city.countryId,
    );

    // Delete the driver
    await this.prisma.driver.delete({ where: { id } });

    return { message: 'Driver removed successfully' };
  }
}
