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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServicesOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly whatsAppService: WwebjsService,
    private config: ConfigService, 

  ) {}

  async getServiceOrders(
    query: QueryServiceOrdersDto,
    userRole: Role,
    userCountryId?: number,
  ) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_SERVICE_ORDERS);

    const filters = buildFilters({
      userRole,
      userCountryId,
      dto: query,
      allowedFields: ['clientName', 'clientNumber', 'hotelName', 'roomNumber'],
    });
    if(query.status) filters.status = query.status
    return paginateAndSort(
      this.prisma.serviceOrder,
      { where: filters, include: { driver: true, vendor: {
        select: {
          id: true,
          name: true,
          phoneNo: true,}
      } } },
      query,
      ['createdAt', 'updatedAt', 'total'],
    );
  }

  async findOne(orderId: number, userRole: Role) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_SERVICE_ORDERS);

    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        vendor: { select: { id: true, name: true, phoneNo: true } },
        driver: true,
        city: true,
      },
    });

    if (!serviceOrder) {
      throw new NotFoundException('Service order not found.');
    }

    return serviceOrder;
  }

  async editServiceOrder(orderId: number, dto: UpdateServiceOrderDto, userRole: Role) {
    // Enforce permissions
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_SERVICE_ORDERS);
  
    // Fetch the service order with necessary relations
    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        vendor: { select: { id: true, name: true, phoneNo: true } },
        driver: true,
        city: true,
        serviceCity: { select: { id: true, locationUrl: true, address: true } },
      },
    });
  
    if (!serviceOrder) {
      throw new NotFoundException('Service order not found.');
    }
  
    // Handle driver assignment
    if (dto.driverId && dto.driverId !== serviceOrder.driverId) {
      await this.assignDriver(serviceOrder, dto.driverId);
    }
  
    const isStatusChanged = dto.status && dto.status !== serviceOrder.status;
  
    // Update the service order
    const updatedServiceOrder = await this.prisma.serviceOrder.update({
      where: { id: orderId },
      data: { ...dto },
      include: { vendor: { select: { id: true, name: true, phoneNo: true } } },
    });
  
    // Notify status change if applicable
    if (isStatusChanged) {
      await this.notifyStatusChange(updatedServiceOrder, dto.status as ServiceOrderStatus);
    }
  
    return updatedServiceOrder;
  }
  
  private async assignDriver(serviceOrder: any, driverId: number) {
    // Fetch driver details
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: { id: true, cityId: true, phoneNo: true },
    });
  
    if (!driver) {
      throw new BadRequestException('The specified driver does not exist.');
    }
  
    // Ensure the driver is in the same city as the order
    if (driver.cityId !== serviceOrder.city.id) {
      throw new BadRequestException('The driver must be located in the same city as the order.');
    }
  
    // Construct notification message
    const driverMessage = `
🔔 تم تعيينك لتوصيل طلب خدمة رقم: ${serviceOrder.id}
    
نوع الخدمه: ${serviceOrder.serviceName}
    
📍 يرجى استلام الأصل من:
- الفندق: ${serviceOrder.hotelName || 'غير متوفر'}
- الغرفة: ${serviceOrder.roomNumber || 'غير متوفر'}
    
🚚 قم بتوصيل الأصل إلى مقدم الخدمة:
- اسم مقدم الخدمة: ${serviceOrder.vendor?.name || 'غير متوفر'}
- العنوان: ${serviceOrder.serviceCity?.address || 'غير متوفر'}
- الموقع الجغرافي: ${serviceOrder.serviceCity?.locationUrl || 'غير متوفر'}
    
📄 رابط تحديث الطلب:
${this.config.get("FRONTEND_URL")}/driver/SERVICE_ORDER/${serviceOrder.driverAccessCode}
    `;
  
    try {
      // Notify the driver
      const driverNotificationSuccess = await this.safeSendMessage(driver.phoneNo, driverMessage);
      if (!driverNotificationSuccess) {
        throw new Error('Failed to notify the driver.');
      }
    } catch (error) {
      console.error(error.message);
      throw new BadRequestException('Failed to notify the driver. Status not updated.');
    }
  
    // Update the service order with the driver ID and new status
    return this.prisma.serviceOrder.update({
      where: { id: serviceOrder.id },
      data: { driverId, status: ServiceOrderStatus.PICKUP },
      include: { vendor: { select: { id: true, name: true, phoneNo: true } } },
    });
  }
  
  public async notifyStatusChange(serviceOrder: any, newStatus: ServiceOrderStatus) {

    // Messages for clients
    const clientMessage = {
      CANCELED: `
❌ طلب الخدمة رقم ${serviceOrder.id} تم إلغاؤه.
🔗 English: Service order #${serviceOrder.id} has been canceled.`,
      
      PICKUP: `
📦 طلب الخدمة رقم ${serviceOrder.id} قيد التوصيل.
🔗 English: Service order #${serviceOrder.id} is being picked up.`,
      
      COMPLETED: `
✅ طلب الخدمة رقم ${serviceOrder.id} تم اكتماله بنجاح.
🔗 Service order #${serviceOrder.id} has been successfully completed.`
    }[newStatus];
    
    try {
      await this.safeSendMessage(serviceOrder.clientNumber, clientMessage);
    } catch (error) {
      console.warn(`Failed to notify client: ${error.message}`);
    }
  
    // Notify vendors for certain statuses
    if (newStatus === "PICKUP" || newStatus === "CANCELED") {
      const vendorMessage = {
        CANCELED: `
  ❌ طلب الخدمة رقم ${serviceOrder.id} تم إلغاؤه.
  🔗 English: Service order #${serviceOrder.id} has been canceled.`,
      }[newStatus];
  
      try {
        if (serviceOrder.vendor?.phoneNo) {
          await this.safeSendMessage(serviceOrder.vendor.phoneNo, vendorMessage);
        }
      } catch (error) {
        console.error(`Failed to notify vendor: ${error.message}`);
        throw new BadRequestException('Failed to notify the vendor.');
      }
    }
  }
    private async safeSendMessage(phoneNo: string, message: string): Promise<boolean> {
    try {
      await this.whatsAppService.sendMessage(phoneNo, message);
      return true;
    } catch (error) {
      console.error(`Failed to send WhatsApp message to ${phoneNo}: ${error.message}`);
      return false;
    }
  }

  async deleteServiceOrder(orderId: number, userRole: Role) {
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_SERVICE_ORDERS);

    const serviceOrder = await this.prisma.serviceOrder.findUnique({ where: { id: orderId } });

    if (!serviceOrder) {
      throw new NotFoundException('Service order not found.');
    }

    return this.prisma.serviceOrder.delete({ where: { id: orderId } });
  }
}


