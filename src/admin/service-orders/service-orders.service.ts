import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryServiceOrdersDto, CreateServiceOrderDto, EditServiceOrderDto } from 'src/admin/dto/service-orders.dto';
import { buildPagination } from 'src/utils/pagination';
import { buildSorting } from 'src/utils/sorting';
import { ServiceOrderStatus } from '@prisma/client';

@Injectable()
export class ServiceOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getServiceOrders(query: QueryServiceOrdersDto, userRole: string, userCountryId?: number) {
    const filters: any = {};

    // Common filters
    if (query.status) {
      filters.status = query.status;
    }
    if (query.clientId) {
      filters.clientId = query.clientId;
    }
    if (query.serviceId) {
      filters.serviceId = query.serviceId;
    }
    if (query.vendorId) {
      filters.vendorId = query.vendorId;
    }

    // Initialize service filter
    let serviceFilter: any = {};

    // Role-based filters
    if (userRole === 'REGIONAL_ADMIN') {
      if (!userCountryId) {
        throw new ForbiddenException('Country ID is required for REGIONAL_ADMIN access.');
      }

      serviceFilter.CityServiceVendor = {
        some: {
          city: {
            countryId: userCountryId,
          },
        },
      };
    }

    // Filters by cityId
    if (query.cityId) {
      serviceFilter.CityServiceVendor = {
        some: {
          ...serviceFilter.CityServiceVendor?.some,
          cityId: query.cityId,
        },
      };
    }

    // Filters by countryId
    if (query.countryId) {
      serviceFilter.CityServiceVendor = {
        some: {
          ...serviceFilter.CityServiceVendor?.some,
          city: {
            ...serviceFilter.CityServiceVendor?.some?.city,
            countryId: query.countryId,
          },
        },
      };
    }

    // Include service filter if any
    if (Object.keys(serviceFilter).length > 0) {
      filters.service = serviceFilter;
    }

    // Pagination and sorting
    const pagination = buildPagination(query.limit, query.offset);
    const sorting = buildSorting(query.sortField, query.sortOrder, ['createdAt', 'updatedAt', 'total']);

    // Fetch service orders
    const serviceOrders = await this.prisma.serviceOrder.findMany({
      where: filters,
      orderBy: sorting,
      ...pagination,
      include: {
        client: true,
        vendor: true,
        service: {
          include: {
            CityServiceVendor: {
              include: {
                city: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Count total orders for pagination metadata
    const total = await this.prisma.serviceOrder.count({ where: filters });

    return {
      items: serviceOrders,
      total,
      page: Math.floor((query.offset || 0) / (query.limit || 10)) + 1,
      pageSize: query.limit || 10,
    };
  }

  async createServiceOrder(dto: CreateServiceOrderDto) {
    // Validate that the vendor and service exist
    const vendor = await this.prisma.vendor.findUnique({ where: { id: dto.vendorId } });
    if (!vendor) {
      throw new NotFoundException('Vendor not found.');
    }

    const service = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    return this.prisma.serviceOrder.create({
      data: {
        ...dto,
        status: ServiceOrderStatus.PENDING,
      },
    });
  }

  async editServiceOrder(orderId: number, dto: EditServiceOrderDto) {
    const serviceOrder = await this.prisma.serviceOrder.findUnique({ where: { id: orderId } });
    if (!serviceOrder) {
      throw new NotFoundException('Service order not found.');
    }

    return this.prisma.serviceOrder.update({
      where: { id: orderId },
      data: dto,
    });
  }

  async deleteServiceOrder(orderId: number) {
    const serviceOrder = await this.prisma.serviceOrder.findUnique({ where: { id: orderId } });
    if (!serviceOrder) {
      throw new NotFoundException('Service order not found.');
    }

    return this.prisma.serviceOrder.delete({
      where: { id: orderId },
    });
  }
}
