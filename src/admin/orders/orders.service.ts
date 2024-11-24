import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryOrdersDto, EditOrderDto } from 'src/admin/dto/orders.dto';
import { buildPagination } from 'src/utils/pagination';
import { buildSorting } from 'src/utils/sorting';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders(query: QueryOrdersDto, userRole: string, userCountryId?: number) {
    const filters: any = {};

    // Common filters
    if (query.id) {
      filters.id = query.id;
    }
    if (query.roomId) {
      filters.roomId = query.roomId;
    }
    if (query.cityId) {
      filters.cityId = query.cityId;
    }

    // Role-based restrictions
    if (userRole === 'REGIONAL_ADMIN') {
      if (!userCountryId) {
        throw new ForbiddenException('Country ID is required for REGIONAL_ADMIN access.');
      }

      filters.city = { countryId: userCountryId };

      if (query.hotelId) {
        filters.room = { hotelId: query.hotelId };
      }
    } else if (userRole === 'SUPER_ADMIN') {
      if (query.hotelId) {
        filters.room = { hotelId: query.hotelId };
      }
    } else {
      throw new ForbiddenException('You do not have access to view orders.');
    }

    // Pagination and sorting
    const pagination = buildPagination(query.limit, query.offset);
    const sorting = buildSorting(query.sortField, query.sortOrder, ['createdAt', 'updatedAt', 'total']);

    // Fetch orders
    const orders = await this.prisma.order.findMany({
      where: filters,
      orderBy: sorting,
      ...pagination,
      include: {
        room: { include: { hotel: true } },
        city: true,
        client: true,
      },
    });

    // Total count for pagination metadata
    const total = await this.prisma.order.count({ where: filters });

    return {
      items: orders,
      total,
      page: Math.floor((query.offset || 0) / (query.limit || 10)) + 1,
      pageSize: query.limit || 10,
    };
  }

  async editOrder(orderId: number, dto: EditOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: dto,
    });
  }

  async deleteOrder(orderId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (order.status === 'DELIVERED') {
      throw new BadRequestException('Completed orders cannot be deleted');
    }
    return this.prisma.order.delete({ where: { id: orderId } });
  }
}
