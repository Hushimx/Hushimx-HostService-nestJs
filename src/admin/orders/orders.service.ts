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
import { ConfigModule, ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly wwebjsService: WwebjsService,
    private config: ConfigService, 
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
      { where: filters, include: { driver: true } },
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
      include: {
        orderItems: true,
        city: true,
        vendor: {
          select: { id: true, name: true,  address: true, phoneNo: true },
        },
        driver: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found. Please check the provided order ID.');
    }

    this.rolePermissionService.canManageInCountry(
      userRole,
      Permission.VIEW_ORDERS,
      userCountryId,
      order.city.countryId,
    );
    return order;
  }

  async editOrder(orderId: number, dto: EditOrderDto, userRole: Role) {
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_ORDERS);

    const order = await this.prisma.deliveryOrder.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        city: true,
        vendor: {
          select: { id: true, name: true, phoneNo: true },
        },
        store: {
          select: { id: true, name: true,locationUrl:true, address: true },
        },
        driver: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found. Please check the provided order ID.');
    }

    if (dto.driverId && dto.driverId !== order.driverId) {
      await this.assignDriver(order, dto.driverId);
    }

    const isStatusChanged = dto.status && dto.status !== order.status;

    const updatedOrder = await this.prisma.deliveryOrder.update({
      where: { id: orderId },
      data: { ...dto,  },
      include: {
        vendor: {
          select: { id: true, name: true, phoneNo: true },
        },
      }
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
      throw new BadRequestException('The specified driver does not exist.');
    }

    if (driver.cityId !== order.city.id) {
      throw new BadRequestException('The driver must be located in the same city as the order.');
    }

    const itemsDescription = order.orderItems
      .map((item: any) => `${item.quantity}x ${item.productTitle}`)
      .join('\n');

      const driverMessage = `
      🚨 تم تعيينك لتوصيل الطلب رقم: ${order.id}.
      
      📦 يرجى استلام الطلب من المتجر:
      - 🏬 المتجر: ${order.store?.name || 'غير متوفر'}
      - 🗺️ العنوان: ${order.store?.address || 'غير متوفر'}
      - 📍 اللوكيشن: ${order.store?.locationUrl || 'غير متوفر'}
      
      🏨 ثم توصيله إلى الفندق:
      - الفندق: ${order.hotelName || 'غير متوفر'}
      - الغرفة: ${order.roomNumber || 'غير متوفر'}
      
      📝 الطلبات:
      ${itemsDescription}
      
      🔗 رابط تحديث الطلب:
      ${this.config.get("FRONTEND_URL")}/driver/DELIVERY_ORDER/${order.driverAccessCode}
      `;
      

    const vendorMessage = `
الطلب رقم ${order.id} قيد الالتقاط.
يرجى تجهيز الطلب لاستلامه من قبل السائق.

الطلبات :
${itemsDescription}

    `;

    try {
      const driverNotificationSuccess = await this.safeSendMessage(driver.phoneNo, driverMessage);
      if (!driverNotificationSuccess) {
        throw new Error(`Failed to send WhatsApp message to driver.`);
      }

      const vendorNotificationSuccess = await this.safeSendMessage(
        order.vendor?.phoneNo,
        vendorMessage,
      );
      if (!vendorNotificationSuccess) {
        throw new Error(`Failed to send WhatsApp message to vendor.`);
      }
    } catch (error) {
      console.error(error.message);
      throw new BadRequestException(
        'Failed to notify the vendor or driver. Status not updated.',
      );
    }

    return this.prisma.deliveryOrder.update({
      where: { id: order.id },
      data: { driverId, status: DeliveryOrderStatus.PICKUP },
      include: { orderItems: true, vendor: { select: { id:true,name: true, phoneNo: true } } },
    });
  }

  public async notifyStatusChange(order: any, newStatus: DeliveryOrderStatus) {
    console.log(newStatus, order);
    const clientMessage = {
      [DeliveryOrderStatus.CANCELED]: `طلبك رقم ${order.id} تم إلغاؤه.`,
      [DeliveryOrderStatus.PICKUP]: `طلبك رقم ${order.id} قيد الالتقاط.`,
      [DeliveryOrderStatus.ON_WAY]: `طلبك رقم ${order.id} في الطريق.`,
      [DeliveryOrderStatus.COMPLETED]: `طلبك رقم ${order.id} تم توصيله بنجاح.`,
    }[newStatus];

    try {
      await this.safeSendMessage(order.clientNumber, clientMessage);
    } catch (error) {
      console.warn(`Failed to notify client: ${error.message}`);
    }

    if (newStatus === DeliveryOrderStatus.PICKUP || newStatus === DeliveryOrderStatus.CANCELED) {
      const vendorMessage = {
        [DeliveryOrderStatus.CANCELED]: `الطلب رقم ${order.id} تم إلغاؤه.`,
      }[newStatus];

      try {
        if (order.vendor?.phoneNo) {
          await this.safeSendMessage(order.vendor.phoneNo, vendorMessage);
        }
      } catch (error) {
        console.error(`Failed to notify vendor: ${error.message}`);
        throw new BadRequestException('Failed to notify the vendor.');
      }
    }
  }

  private async safeSendMessage(phoneNo: string, message: string): Promise<boolean> {
    try {
      await this.wwebjsService.sendMessage(phoneNo, message);
      return true;
    } catch (error) {
      console.error(`Failed to send WhatsApp message to ${phoneNo}: ${error.message}`);
      return false;
    }
  }

  async deleteOrder(orderId: number, userRole: Role) {
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_ORDERS);

    const order = await this.prisma.deliveryOrder.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found. Please check the provided order ID.');
    }
    if (order.status === DeliveryOrderStatus.COMPLETED) {
      throw new BadRequestException('Completed orders cannot be deleted.');
    }

    return this.prisma.deliveryOrder.delete({ where: { id: orderId } });
  }
}
