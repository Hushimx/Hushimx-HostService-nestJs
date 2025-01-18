import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryOrdersDto, EditOrderDto } from 'src/admin/dto/orders.dto';
import { paginateAndSort, PaginatedResult } from 'src/utils/pagination';
import { RolePermissionService } from 'src/admin/auth/role-permission-service/role-permission-service.service';
import { Permission } from 'src/admin/auth/role-permission-service/rolesData';
import { Role } from 'src/admin/auth/role-permission-service/rolesData';
import { buildFilters } from 'src/utils/filters';
import { DeliveryOrderStatus } from '@prisma/client';
import { WwebjsService } from 'src/wwebjs/wwebjs.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly wwebjsService: WwebjsService,
  ) {}

  async getOrders(
    dto: QueryOrdersDto,
    userRole: Role,
    userCountryId: number,
  ): Promise<PaginatedResult<any>> {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_ORDERS);

    const filters = buildFilters({
      userRole,
      userCountryId,
      dto,
      allowedFields: [
        'id',
        'roomId',
        'roomNumber',
        'hotelName',
        'hotelId',
        'clientId',
        'clientNumber',
        'phoneNo',
        'storeSection',
        'status',
        'notes',
      ],
    });

    return paginateAndSort(
      this.prisma.deliveryOrder,
      { where: filters },
      {
        page: dto.page || 1,
        limit: dto.limit || 10,
        sortField: dto.sortField,
        sortOrder: dto.sortOrder,
      },
      ['createdAt', 'updatedAt', 'total'],
    );
  }

  async getOrder(orderId: number, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_ORDERS);

    const order = await this.prisma.deliveryOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        clientName: true,
        clientNumber: true,
        hotelName: true,
        roomNumber: true,
        status: true,
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

    this.rolePermissionService.canManageInCountry(userRole, Permission.VIEW_ORDERS, userCountryId, order.city.countryId);
    return order;
  }

  async editOrder(orderId: number, dto: EditOrderDto, userRole: Role) {
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_ORDERS);

    const order = await this.prisma.deliveryOrder.findUnique({
      where: { id: orderId },
      include: { orderItems: true, city: true, driver: true },
    });

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found. Please check the provided order ID.',
      });
    }

    if (dto.driverId && dto.driverId !== order.driverId) {
      // Assign the new driver and trigger status change to PICKUP
      await this.assignDriver(order, dto.driverId);
    }

    const isStatusChanged = dto.status && dto.status !== order.status;

    // Update the order with any other fields (except driver and status handled above)
    const updatedOrder = await this.prisma.deliveryOrder.update({
      where: { id: orderId },
      data: { ...dto, driverId: undefined, status: undefined },
    });

    if (isStatusChanged) {
      await this.notifyStatusChange(updatedOrder, dto.status);
    }

    return updatedOrder;
  }

  private async assignDriver(order: any, driverId: number) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: { id: true, cityId: true, phoneNo: true },
    });

    if (!driver) {
      throw new BadRequestException({
        code: 'DRIVER_NOT_FOUND',
        message: 'The specified driver does not exist.',
      });
    }

    if (driver.cityId !== order.city.id) {
      throw new BadRequestException({
        code: 'INVALID_DRIVER_CITY',
        message: 'The driver must be located in the same city as the order.',
      });
    }

    // Update the order with the assigned driver and status to PICKUP
    const updatedOrder = await this.prisma.deliveryOrder.update({
      where: { id: order.id },
      data: { driverId, status: DeliveryOrderStatus.PICKUP },
      include: { orderItems: true, city: true },
    });

    // Notify driver
    const itemsDescription = updatedOrder.orderItems
      .map((item: any) => `${item.quantity}x ${item.productTitle}`)
      .join('\n');

    try {
      await this.wwebjsService.sendMessage(
        driver.phoneNo,
        `You have been assigned to deliver order ID ${updatedOrder.id}. Items:\n${itemsDescription}\n\nلديكم طلب جديد للتوصيل رقم ${updatedOrder.id}. المنتجات:\n${itemsDescription}`,
      );
    } catch (error) {
      console.error(`Failed to send WhatsApp message to driver: ${error.message}`);
    }

    // Trigger status change notifications
    await this.notifyStatusChange(updatedOrder, DeliveryOrderStatus.PICKUP);
  }

  private async notifyStatusChange(order: any, newStatus: DeliveryOrderStatus) {
    const clientPhoneNumber = order.clientNumber;
    const vendorPhoneNumber = order.vendor?.phoneNo;

    const messages = {
      [DeliveryOrderStatus.CANCELED]: `Your order with ID ${order.id} has been canceled.\nتم إلغاء طلبك رقم ${order.id}.`,
      [DeliveryOrderStatus.PICKUP]: `Your order with ID ${order.id} is on its way.\nطلبك رقم ${order.id} في الطريق.`,
      [DeliveryOrderStatus.ON_WAY]: `Your order with ID ${order.id} is out for delivery.\nطلبك رقم ${order.id} في طريقه للتوصيل.`,
      [DeliveryOrderStatus.COMPLETED]: `Your order with ID ${order.id} has been successfully completed.\nتم إكمال طلبك رقم ${order.id} بنجاح.`,
    };

    const message = messages[newStatus];

    try {
      await this.wwebjsService.sendMessage(`${clientPhoneNumber}`, message);
    } catch (error) {
      console.warn(`Failed to send WhatsApp message to client: ${error.message}`);
    }

    if (vendorPhoneNumber || newStatus === DeliveryOrderStatus.PICKUP) {
      try {
        switch (newStatus) {
          case DeliveryOrderStatus.CANCELED:
            await this.wwebjsService.sendMessage(
              `${vendorPhoneNumber}`,
              `Order ID ${order.id} has been canceled.`,
            );
            break;

          case DeliveryOrderStatus.PICKUP:
            const vendorItemsDescription = order.orderItems
              .map((item: any) => `${item.quantity}x ${item.productTitle}`)
              .join('\n');
            await this.wwebjsService.sendMessage(
              `${vendorPhoneNumber}`,
              `Order ID ${order.id} is ready for pickup. Items:\n${vendorItemsDescription}.`,
            );
            break;

          case DeliveryOrderStatus.ON_WAY:
          case DeliveryOrderStatus.COMPLETED:
            await this.wwebjsService.sendMessage(
              `${vendorPhoneNumber}`,
              `Order ID ${order.id} has been ${newStatus.toLowerCase()}.`,
            );
            break;

          default:
            console.warn(`Unhandled status: ${newStatus}`);
            break;
        }
      } catch (error) {
        console.error(`Failed to send WhatsApp message to vendor/driver: ${error.message}`);
        throw new BadRequestException({
          code: 'WHATSAPP_ERROR',
          message: 'An error occurred while sending a WhatsApp notification to the vendor or driver.',
        });
      }
    }
  }

  async deleteOrder(orderId: number, userRole: Role) {
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_ORDERS);

    const order = await this.prisma.deliveryOrder.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found. Please check the provided order ID.',
      });
    }
    if (order.status === DeliveryOrderStatus.COMPLETED) {
      throw new BadRequestException({
        code: 'CANNOT_DELETE_COMPLETED_ORDER',
        message: 'Completed orders cannot be deleted.',
      });
    }

    return this.prisma.deliveryOrder.delete({ where: { id: orderId } });
  }
}
