import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginateAndSort } from 'src/utils/pagination';
import { RolePermissionService } from 'src/admin/auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/admin/auth/role-permission-service/rolesData';
import { ServiceOrderStatus } from '@prisma/client';
import { buildFilters } from 'src/utils/filters';
import { QueryServiceOrdersDto } from './dto/query-order.dto';
import { UpdateServiceOrderDto } from './dto/update-order.dto';
import { WwebjsService } from 'src/wwebjs/wwebjs.service';

@Injectable()
export class ServicesOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly whatsAppService: WwebjsService,
  ) {}

  async getServiceOrders(query: QueryServiceOrdersDto, userRole: Role, userCountryId?: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_SERVICE_ORDERS);

    const filters = buildFilters({
      userRole,
      userCountryId,
      dto: query,
      allowedFields: ['clientName', 'clientNumber', 'hotelName', 'roomNumber'],
    });

    const allowedSortFields = ['createdAt', 'updatedAt', 'total'];
    const result = await paginateAndSort(
      this.prisma.serviceOrder,
      { where: filters },
      query,
      allowedSortFields,
    );

    return result;
  }

  async findOne(orderId: number, userRole: Role) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_SERVICE_ORDERS);

    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        vendor: { select: { id: true, name: true } },
      },
    });

    if (!serviceOrder) throw new NotFoundException('Service order not found.');

    return serviceOrder;
  }

  async editServiceOrder(orderId: number, dto: UpdateServiceOrderDto, userRole: Role) {
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_SERVICE_ORDERS);

    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: { service: true, city: true, driver: true },
    });

    if (!serviceOrder) throw new NotFoundException('Service order not found.');

    if (dto.driverId && dto.driverId !== serviceOrder.driverId) {
      await this.assignDriver(serviceOrder, dto.driverId);
    }

    const isStatusChanged = dto.status && dto.status !== serviceOrder.status;

    const updatedServiceOrder = await this.prisma.serviceOrder.update({
      where: { id: orderId },
      data: { ...dto, driverId: undefined, status: undefined },
    });

    if (isStatusChanged) {
      await this.notifyStatusChange(updatedServiceOrder, dto.status);
    }

    return updatedServiceOrder;
  }

  private async assignDriver(serviceOrder: any, driverId: number) {
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

    if (driver.cityId !== serviceOrder.city.id) {
      throw new BadRequestException({
        code: 'INVALID_DRIVER_CITY',
        message: 'The driver must be located in the same city as the service order.',
      });
    }

    const updatedServiceOrder = await this.prisma.serviceOrder.update({
      where: { id: serviceOrder.id },
      data: { driverId, status: ServiceOrderStatus.PICKUP },
      include: { service: true, city: true },
    });

    const itemsDescription = updatedServiceOrder.service.description;

    try {
      await this.whatsAppService.sendMessage(
        `${driver.phoneNo}@c.us`,
        `تم تعيينك لتوصيل الطلب الخدمي برقم ${updatedServiceOrder.id}. الخدمة: ${itemsDescription}\nYou have been assigned to deliver service order ID ${updatedServiceOrder.id}. Service: ${itemsDescription}`,
      );
    } catch (error) {
      console.error(`Failed to send WhatsApp message to driver: ${error.message}`);
      throw new BadRequestException({
        code: 'WHATSAPP_DRIVER_ERROR',
        message: 'Failed to notify the driver via WhatsApp.',
      });
    }

    await this.notifyStatusChange(updatedServiceOrder, ServiceOrderStatus.PICKUP);
  }

  private async notifyStatusChange(serviceOrder: any, newStatus: ServiceOrderStatus) {
    const clientPhoneNumber = serviceOrder.client?.phoneNo;
    const vendorPhoneNumber = serviceOrder.vendor?.phoneNo;

    const messages = {
      [ServiceOrderStatus.CANCELED]: `تم إلغاء طلب الخدمة الخاص بك برقم ${serviceOrder.id}.\nYour service order with ID ${serviceOrder.id} has been canceled.`,
      [ServiceOrderStatus.PICKUP]: `طلب الخدمة الخاص بك برقم ${serviceOrder.id} في الطريق.\nYour service order with ID ${serviceOrder.id} is on its way.`,
      [ServiceOrderStatus.IN_PROGRESS]: `طلب الخدمة الخاص بك برقم ${serviceOrder.id} قيد التنفيذ.\nYour service order with ID ${serviceOrder.id} is now in progress.`,
      [ServiceOrderStatus.COMPLETED]: `تم إكمال طلب الخدمة الخاص بك برقم ${serviceOrder.id} بنجاح.\nYour service order with ID ${serviceOrder.id} has been successfully completed.`,
    };

    const message = messages[newStatus];

    // Notify client
    if (clientPhoneNumber) {
      try {
        await this.whatsAppService.sendMessage(`${clientPhoneNumber}@c.us`, message);
      } catch (error) {
        console.warn(`Failed to send WhatsApp message to client: ${error.message}`);
      }
    }

    // Notify vendor or driver - fail hard if it fails
    if (vendorPhoneNumber && newStatus === ServiceOrderStatus.PICKUP) {
      try {
        await this.whatsAppService.sendMessage(
          `${vendorPhoneNumber}@c.us`,
          `تم تعيين طلب الخدمة الخاص بك برقم ${serviceOrder.id}.\nYour service order with ID ${serviceOrder.id} is in progress.`,
        );
      } catch (error) {
        console.error(`Failed to send WhatsApp message to vendor: ${error.message}`);
        throw new BadRequestException({
          code: 'WHATSAPP_VENDOR_ERROR',
          message: 'Failed to notify the vendor via WhatsApp.',
        });
      }
    }
  }

  async deleteServiceOrder(orderId: number, userRole: Role) {
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_SERVICE_ORDERS);

    const serviceOrder = await this.prisma.serviceOrder.findUnique({ where: { id: orderId } });

    if (!serviceOrder) throw new NotFoundException('Service order not found.');

    return this.prisma.serviceOrder.delete({ where: { id: orderId } });
  }
}
