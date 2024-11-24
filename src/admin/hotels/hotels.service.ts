// src/hotels/hotels.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHotelDto, EditHotelDto, QueryHotelsDto } from '../dto/Hotels.dto';
import { buildPagination, paginateAndSort } from 'src/utils/pagination';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  async getHotels(query: QueryHotelsDto, userRole: string, userCountryId?: number) {
    // Initialize filters
    const filters: any = {};
  
    // Common filters
    if (query.name) {
      filters.name = { contains: query.name, mode: 'insensitive' }; // Case-insensitive search
    }
  
    // Regional Admin (Default Case)
    if (userRole !== 'super_admin') {
      if (!userCountryId) {
        throw new ForbiddenException('Country ID is required for REGIONAL_ADMIN access.');
      }
  
      filters.city = {
        countryId: userCountryId, // Restrict to assigned country
      };
  
      if (query.city) {
        filters.city = {
          ...filters.city,
          name: { contains: query.city, mode: 'insensitive' }, // Filter by city name
        };
      }
    }
  
    // Super Admin (Special Case)
    if (userRole === 'super_admin') {
      if (query.city) {
        filters.city = { name: { contains: query.city, mode: 'insensitive' } }; // Match city name
      }
      if (query.country) {
        filters.city = {
          ...filters.city,
          country: { name: { contains: query.country, mode: 'insensitive' } }, // Match country name
        };
      }
    }
  
    // Allowed sorting fields
    const allowedSortFields = ['name', 'createdAt', 'updatedAt'];
  
    // Use paginateAndSort for pagination and sorting
    const paginatedResult = await paginateAndSort(
      this.prisma.hotel, // Prisma model
      {
        where: filters,
        include: {
          city: {
            include: { country: true }, // Include city and country details
          },
        },
      },
      {
        page: query.page,
        limit: query.limit,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
      allowedSortFields
    );
  
    return paginatedResult;
  }
      
  async createHotel(data: CreateHotelDto, userRole: string, userCountry?: Number) {
    if (userRole === 'REGIONAL_ADMIN') {
      // Validate city belongs to the admin's country
      const city = await this.prisma.city.findUnique({
        where: { id: data.cityId },
        include: { country: true },
      });

      if (!city) {
        throw new NotFoundException('City not found.');
      }

      if (city.country.id !== userCountry) {
        throw new ForbiddenException('You can only create hotels in your assigned country.');
      }
    }

    // Create the hotel
    return this.prisma.hotel.create({
      data: {
        name: data.name,
        cityId: data.cityId,
      },
    });
  }

  async editHotel(
    hotelId: number,
    data: EditHotelDto,
    userRole: string,
    userCountry?: number,
  ) {
    // Fetch the hotel to validate
    const existingHotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { city: { include: { country: true } } },
    });

    if (!existingHotel) {
      throw new NotFoundException('Hotel not found.');
    }

    if (userRole === 'REGIONAL_ADMIN') {
      if (existingHotel.city.country.id !== userCountry) {
        throw new ForbiddenException('You can only edit hotels in your assigned country.');
      }

      if (data.cityId) {
        const newCity = await this.prisma.city.findUnique({
          where: { id: data.cityId },
          include: { country: true },
        });

        if (!newCity || newCity.country.id !== userCountry) {
          throw new ForbiddenException('You can only assign hotels to cities in your country.');
        }
      }
    }

    // Update the hotel
    return this.prisma.hotel.update({
      where: { id: hotelId },
      data,
    });
  }

  async deleteHotel(hotelId: number, userRole: string, userCountry?: number) {
    // Fetch the hotel to validate
    const existingHotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { city: { include: { country: true } } },
    });

    if (!existingHotel) {
      throw new NotFoundException('Hotel not found.');
    }

    if (userRole === 'REGIONAL_ADMIN') {
      if (existingHotel.city.country.id !== userCountry) {
        throw new ForbiddenException('You can only delete hotels in your assigned country.');
      }
    }

    // Delete the hotel
    return this.prisma.hotel.delete({
      where: { id: hotelId },
    });
  }
}
