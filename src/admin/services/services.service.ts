import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto, ManageCityVendorDto, QueryServiceDto } from '../dto/services.dto';
import { paginateAndSort, PaginatedResult } from 'src/utils/pagination';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  // Show all services with optional pagination and sorting
  async findAll(query: QueryServiceDto): Promise<PaginatedResult<any>> {
    return paginateAndSort(
      this.prisma.service,
      {
        where: {},

      },
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
      ['name', 'createdAt'],
    );
  }

  // Show a single service by slug
  async findOne(slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  // Create a new service
  async create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: createServiceDto,
    });
  }

  // Update an existing service
  async update(slug: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({ where: { slug } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service.update({
      where: { slug },
      data: updateServiceDto,
    });
  }

  // Delete a service
  async remove(slug: string) {
    const service = await this.prisma.service.findUnique({ where: { slug } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service.delete({ where: { slug } });
  }

  async findCityVendors(
    serviceSlug: string,
    userRole: string,
    userCountryId?: number,
    cityId?: number,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { slug: serviceSlug },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const filters: any = { serviceId: service.id };

    if (userRole !== 'SUPER_ADMIN') {
      if (!userCountryId) {
        throw new ForbiddenException('Country ID is required for REGIONAL_ADMIN access.');
      }
      filters.city = { countryId: userCountryId };
    }

    if (cityId) {
      filters.cityId = cityId;
    }

    return this.prisma.cityServiceVendor.findMany({
      where: filters,
      include: { city: true, vendor: true },
    });
  }

  // Add a vendor-city link for a service (using slug for service identification)
  async addCityVendor(
    serviceSlug: string,
    manageCityVendorDto: ManageCityVendorDto,
    userRole: string,
    userCountryId?: number,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { slug: serviceSlug },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const city = await this.prisma.city.findUnique({
      where: { id: manageCityVendorDto.cityId },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    if (userRole === 'REGIONAL_ADMIN' && city.countryId !== userCountryId) {
      throw new ForbiddenException('You can only manage vendors for cities in your assigned country.');
    }

    try {
      return await this.prisma.cityServiceVendor.create({
        data: {
          serviceId: service.id,
          cityId: manageCityVendorDto.cityId,
          vendorId: manageCityVendorDto.vendorId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Vendor already linked to this service in the specified city.');
      }
      throw error;
    }
  }

  // Update a city-vendor link
  async updateCityVendor(
    id: number,
    manageCityVendorDto: ManageCityVendorDto,
    userRole: string,
    userCountryId?: number,
  ) {
    const cityVendor = await this.prisma.cityServiceVendor.findUnique({
      where: { id },
      include: { city: true },
    });

    if (!cityVendor) {
      throw new NotFoundException('City-Vendor link not found');
    }

    if (userRole === 'REGIONAL_ADMIN' && cityVendor.city.countryId !== userCountryId) {
      throw new ForbiddenException('You can only update vendors in your assigned country.');
    }

    return this.prisma.cityServiceVendor.update({
      where: { id },
      data: manageCityVendorDto,
    });
  }

  // Delete a city-vendor link
  async removeCityVendor(
    id: number,
    userRole: string,
    userCountryId?: number,
  ) {
    const cityVendor = await this.prisma.cityServiceVendor.findUnique({
      where: { id },
      include: { city: true },
    });

    if (!cityVendor) {
      throw new NotFoundException('City-Vendor link not found');
    }

    if (userRole === 'REGIONAL_ADMIN' && cityVendor.city.countryId !== userCountryId) {
      throw new ForbiddenException('You can only delete vendors in your assigned country.');
    }

    return this.prisma.cityServiceVendor.delete({
      where: { id },
    });
  }
}
