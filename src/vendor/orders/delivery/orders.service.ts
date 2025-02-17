import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginateAndSort, PaginatedResult } from 'src/utils/pagination';
import { RolePermissionService } from 'src/admin/auth/role-permission-service/role-permission-service.service';
import { Permission } from 'src/admin/auth/role-permission-service/rolesData';
import { Role } from 'src/admin/auth/role-permission-service/rolesData';
import { QueryOrdersDto } from './dto/delivery-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async getOrders(
    dto: QueryOrdersDto,
    user: any,
  ): Promise<PaginatedResult<any>> {
    const filters: any = {};
    if(dto.storeId) filters.storeId = dto.storeId;
    if(dto.status) filters.status = dto.status;
    if(dto.clientNumber) filters.clientNumber = {contains: dto.clientNumber};
    console.log(filters);

    return paginateAndSort(
      this.prisma.deliveryOrder,
      { where: { vendorId: user.id ,...filters},select:{
        id: true,
        createdAt:true,
        clientName: true,
        clientNumber: true,
        storeName: true,
        hotelName: true,
        roomNumber: true,

        status: true,
        notes: true,
        total: true,

            } },
      {
        page: dto.page || 1,
        limit: dto.limit || 10,
        sortField: dto.sortField,
        sortOrder: dto.sortOrder,
      },
      ['createdAt', 'updatedAt', 'total'],
    );
  }

  async getOrder(orderId: number, user) {

    const order = await this.prisma.deliveryOrder.findUnique({
      where: { id: orderId,vendorId: user.vendorId },
      select: {
        id: true,
        clientName: true,
        clientNumber: true,
        status: true,
        currencySign: true,
        paymentMethod: true,
        notes: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        orderItems: {
          select: { id: true, quantity: true, price: true, productTitle: true },
        },
        city: {
          select: { name: true, countryId: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found. Please check the provided order ID.',
      });
    }

    return order;
  }

}
