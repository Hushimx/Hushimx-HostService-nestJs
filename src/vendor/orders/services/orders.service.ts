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
import { WwebjsService } from 'src/wwebjs/wwebjs.service';

@Injectable()
export class ServicesOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly whatsAppService: WwebjsService,
  ) {}

  // Find all service orders with filters, pagination, and sorting
  async getServiceOrders(query: QueryServiceOrdersDto, user) {
    const filters: { vendorId: number, serviceId?: number, clientNumber?: { contains: string } ,status?: ServiceOrderStatus} = { vendorId: user.vendorId };
    if(query.serviceId) filters.serviceId = query.serviceId;
    if(query.clientNumber) filters.clientNumber = {contains: query.clientNumber};
    if(query.status) filters.status = query.status;
    filters.vendorId = user.id;

    // Pagination and sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'total'];
    const result = await paginateAndSort(
      this.prisma.serviceOrder,
      { where: filters,select: { id: true, clientNumber: true, serviceName: true, currencySign: true, status: true} },
      query,
      allowedSortFields,
    );

    return result;
  }

  // Find a single service order
  async findOne(orderId: number, user) {

    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { id: orderId, vendorId: user.id },
      select: {
        id: true,
        clientNumber: true,
        serviceName: true,
        hotelName: true,
        roomNumber: true,
        currencySign: true,
        status: true,
        notes: true,
        total: true,
        createdAt: true,
        updatedAt: true,

      }

    });

    if (!serviceOrder) throw new NotFoundException('Service order not found.');

    return serviceOrder;
  }

  // // // Create a new service order
  // // async createServiceOrder(dto: CreateServiceOrderDto, userRole: Role) {
  // //   this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_SERVICE_ORDERS);

  // //   const service = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
  // //   const vendor = await this.prisma.vendor.findUnique({ where: { id: dto.vendorId } });

  // //   if (!service) throw new NotFoundException('Service not found.');
  // //   if (!vendor) throw new NotFoundException('Vendor not found.');

  // //   return this.prisma.serviceOrder.create({
  // //     data: { ...dto, status: ServiceOrderStatus.PENDING },
  // //   });
  // // }

  // // Edit a service order
  // async editServiceOrder(orderId: number, dto: UpdateServiceOrderDto, userRole: Role) {
  //   this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_SERVICE_ORDERS);

  //   const serviceOrder = await this.prisma.serviceOrder.findUnique({
  //     where: { id: orderId },
  //     include: { service: true, city: true, driver: true },
  //   });

  //   if (!serviceOrder) throw new NotFoundException('Service order not found.');

  //   if (dto.status === ServiceOrderStatus.PICKUP && !serviceOrder.driverId) {
  //     throw new BadRequestException({
  //       code: 'DRIVER_REQUIRED',
  //       message: 'A driver must be assigned before marking the order as PICKUP.',
  //     });
  //   }

  //   if (dto.driverId) {
  //     await this.assignDriver(serviceOrder, dto.driverId);
  //   }

  //   const isStatusChanged = dto.status && dto.status !== serviceOrder.status;

  //   const updatedServiceOrder = await this.prisma.serviceOrder.update({
  //     where: { id: orderId },
  //     data: dto,
  //   });

  //   if (isStatusChanged) {
  //     await this.notifyStatusChange(updatedServiceOrder, dto.status);
  //   }

  //   return updatedServiceOrder;
  // }

  // private async assignDriver(serviceOrder: any, driverId: number) {
  //   const driver = await this.prisma.driver.findUnique({
  //     where: { id: driverId },
  //     select: { id: true, cityId: true, phoneNo: true },
  //   });

  //   if (!driver) {
  //     throw new BadRequestException({
  //       code: 'DRIVER_NOT_FOUND',
  //       message: 'The specified driver does not exist.',
  //     });
  //   }

  //   if (driver.cityId !== serviceOrder.city.id) {
  //     throw new BadRequestException({
  //       code: 'INVALID_DRIVER_CITY',
  //       message: 'The driver must be located in the same city as the service order.',
  //     });
  //   }

  //   await this.prisma.serviceOrder.update({
  //     where: { id: serviceOrder.id },
  //     data: { driverId },
  //   });

  //   const itemsDescription = serviceOrder.service.title;

  //   await this.whatsAppService.sendMessage(
  //     `${driver.phoneNo}@c.us`,
  //     `تم تعيينك لتوصيل الطلب الخدمي برقم ${serviceOrder.id}. الخدمة: ${itemsDescription}\nYou have been assigned to deliver service order ID ${serviceOrder.id}. Service: ${itemsDescription}`,
  //   );
  // }

  // private async notifyStatusChange(serviceOrder: any, newStatus: ServiceOrderStatus) {
  //   const clientPhoneNumber = serviceOrder.client.phoneNo;
  //   const vendorPhoneNumber = serviceOrder.vendor?.phoneNo;

  //   const messages = {
  //     [ServiceOrderStatus.CANCELED]: `تم إلغاء طلب الخدمة الخاص بك برقم ${serviceOrder.id}.\nYour service order with ID ${serviceOrder.id} has been canceled.`,
  //     [ServiceOrderStatus.PICKUP]: `طلب الخدمة الخاص بك برقم ${serviceOrder.id} في الطريق.\nYour service order with ID ${serviceOrder.id} is on its way.`,
  //     [ServiceOrderStatus.IN_PROGRESS]: `طلب الخدمة الخاص بك برقم ${serviceOrder.id} قيد التنفيذ.\nYour service order with ID ${serviceOrder.id} is now in progress.`,
  //     [ServiceOrderStatus.COMPLETED]: `تم إكمال طلب الخدمة الخاص بك برقم ${serviceOrder.id} بنجاح.\nYour service order with ID ${serviceOrder.id} has been successfully completed.`,
  //   };

  //   const message = messages[newStatus];

  //   switch (newStatus) {
  //     case ServiceOrderStatus.CANCELED:
  //       await this.whatsAppService.sendMessage(`${clientPhoneNumber}@c.us`, message);
  //       if (vendorPhoneNumber) {
  //         await this.whatsAppService.sendMessage(`${vendorPhoneNumber}@c.us`, `تم إلغاء طلب الخدمة برقم ${serviceOrder.id}.\nService order ID ${serviceOrder.id} has been canceled.`);
  //       }
  //       break;

  //     case ServiceOrderStatus.PICKUP:
  //     case ServiceOrderStatus.IN_PROGRESS:
  //     case ServiceOrderStatus.COMPLETED:
  //       await this.whatsAppService.sendMessage(`${clientPhoneNumber}@c.us`, message);
  //       break;

  //     default:
  //       console.warn(`Unhandled status: ${newStatus}`);
  //       break;
  //   }
  // }

  // // Delete a service order
  // async deleteServiceOrder(orderId: number, userRole: Role) {
  //   this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_SERVICE_ORDERS);

  //   const serviceOrder = await this.prisma.serviceOrder.findUnique({ where: { id: orderId } });

  //   if (!serviceOrder) throw new NotFoundException('Service order not found.');

  //   return this.prisma.serviceOrder.delete({ where: { id: orderId } });
  // }
}
