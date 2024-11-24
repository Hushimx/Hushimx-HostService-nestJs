import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginateAndSort, PaginatedResult } from 'src/utils/pagination';
import { CreateVendorDto, QueryVendorDto, UpdateVendorDto } from '../dto/vendor.dto';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVendorDto: CreateVendorDto, userRole: string, userCountryId?: number) {
    // Ensure regional admins can only create vendors in their country
    if (userRole === 'REGIONAL_ADMIN') {
      const city = await this.prisma.city.findUnique({
        where: { id: createVendorDto.cityId },
        select: { countryId: true },
      });

      if (!city || city.countryId !== userCountryId) {
        throw new ForbiddenException('You can only add vendors in your assigned country.');
      }
    }

    return this.prisma.vendor.create({
      data: createVendorDto,
    });
  }

  async findAll(
    query: QueryVendorDto,
    userRole: string,
    userCountryId?: number,
  ): Promise<PaginatedResult<any>> {
    const filters: any = {};

    // Super Admin: Optional country filtering
    if (userRole === 'SUPER_ADMIN' && query.countryId) {
      filters.city = { countryId: query.countryId };
    }

    // Regional Admin: Restrict to their assigned country
    if (userRole === 'REGIONAL_ADMIN') {
      if (!userCountryId) {
        throw new ForbiddenException('Country ID is required for REGIONAL_ADMIN access.');
      }
      filters.city = { countryId: userCountryId };
    }

    // Use the pagination and sorting utility
    return paginateAndSort(
      this.prisma.vendor,
      {
        where: filters,
        include: { city: { include: { country: true } } }, // Include city and country data
      },
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
      ['name', 'cityId', 'createdAt'], // Allowed sort fields
    );
  }

  async findOne(id: number, userRole: string, userCountryId?: number) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: { city: true },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found.');
    }

    // Apply country-based restrictions for regional admins
    if (userRole === 'REGIONAL_ADMIN' && vendor.city.countryId !== userCountryId) {
      throw new ForbiddenException('Access denied to this vendor.');
    }

    return vendor;
  }

  async update(id: number, updateVendorDto: UpdateVendorDto, userRole: string, userCountryId?: number) {
    const vendor = await this.findOne(id, userRole, userCountryId);

    return this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
    });
  }

  async remove(id: number, userRole: string, userCountryId?: number) {
    const vendor = await this.findOne(id, userRole, userCountryId);

    return this.prisma.vendor.delete({
      where: { id },
    });
  }
}
