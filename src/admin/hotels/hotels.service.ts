import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHotelDto, EditHotelDto, QueryHotelsDto } from '../dto/Hotels.dto';
import { paginateAndSort } from 'src/utils/pagination';
import { Role,Permission} from 'src/auth/role-permission-service/rolesData';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';

@Injectable()
export class HotelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  /**
   * Retrieve hotels with filters, sorting, and pagination
   */
  async getHotels(query: QueryHotelsDto, userRole: Role, userCountryId?: number) {
    // Enforce permission to view hotels
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_HOTELS);

    const filters: any = {};

    // Default filter: Restrict access to user's country
    filters.city = { countryId: userCountryId };

    // Special case: Unrestricted access for ACCESS_ALL_HOTELS
    if (this.rolePermissionService.hasPermission(userRole, Permission.ACCESS_ALL_HOTELS)) {
      delete filters.city;
      if (query.country) {
        filters.city = {
          ...filters.city,
          country: { id: query.country },
        };
      }
      if (query.city) {
        filters.cityId = query.city;
      }
    }

    // Common filters
    if (query.name) {
      console.log(query.name,3333)
      filters.name = { contains: query.name, mode: 'insensitive' };
    }

    const allowedSortFields = ['name', 'createdAt', 'updatedAt'];

    return paginateAndSort(
      this.prisma.hotel,
      {
        where: filters,
        include: { city: true },
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

 async getHotel(hotelId: number, userRole: Role, userCountryId: number) {
    // Enforce permission to view hotels
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_HOTELS);
    const hotel = await this.prisma.hotel.findUnique({ 
      where: { id: hotelId },
      include: { city: { select: { name:true,countryId: true } } },
    });
    console.log(hotel)
    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
    }
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.CREATE_HOTELS,
      userCountryId,
      hotel.city.countryId,
    );
    return hotel

  }

  /**
   * Create a new hotel
   */
  async createHotel(data: CreateHotelDto, userRole: Role, userCountryId?: number) {
    // Enforce permission to create hotels
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_HOTELS);

    // Validate the city and enforce country-specific management
    const city = await this.prisma.city.findUnique({
      where: { id: data.cityId },
      include: { country: true },
    });

    if (!city) {
      throw new NotFoundException('City not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.CREATE_HOTELS,
      userCountryId,
      city.country.id,
    );

    return this.prisma.hotel.create({
      data: { name: data.name, cityId: data.cityId,address: data.address, locationUrl: data.locationUrl },
    });
  }

  /**
   * Edit an existing hotel
   */
  async editHotel(
    hotelId: number,
    data: EditHotelDto,
    userRole: Role,
    userCountryId?: number,
  ) {
    // Enforce permission to edit hotels
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_HOTELS);

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { city: { include: { country: true } } },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.EDIT_HOTELS,
      userCountryId,
      hotel.city.country.id,
    );

    return this.prisma.hotel.update({
      where: { id: hotelId },
      data,
    });
  }

  /**
   * Delete an existing hotel
   */
  async deleteHotel(hotelId: number, userRole: Role, userCountryId?: number) {
    // Enforce permission to delete hotels
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_HOTELS);

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { city: { include: { country: true } } },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.DELETE_HOTELS,
      userCountryId,
      hotel.city.country.id,
    );

    return this.prisma.hotel.delete({
      where: { id: hotelId },
    });
  }
}
