import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DeliveryOrderStatus, ServiceOrderStatus } from '@prisma/client';
import { OrdersService } from 'src/admin/orders/orders.service';
import { ServicesOrdersService } from 'src/admin/services/orders/orders.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serviceOrdersService: ServicesOrdersService,
    private readonly deliveryOrdersService: OrdersService,
  ) {}

  // Validate driver code and return the associated order
  async validateDriverCode(type: 'SERVICE_ORDER' | 'DELIVERY_ORDER', driverCode: string) {
    const now = new Date();

    // Query the correct table based on the type
    let order;
    if (type === 'SERVICE_ORDER') {
      order = await this.prisma.serviceOrder.findFirst({
        where: {
          driverAccessCode: driverCode,
          createdAt: { gte: new Date(now.getTime() - 3 * 60 * 60 * 1000) }, // Valid for 3 hours
        },
        select: {serviceName:true,currencySign:true, vendor: {
          select: {id: true, name: true, phoneNo: true },
        } },
      });
    } else if (type === 'DELIVERY_ORDER') {
      order = await this.prisma.deliveryOrder.findFirst({
        where: {
          driverAccessCode: driverCode,
          createdAt: { gte: new Date(now.getTime() - 3 * 60 * 60 * 1000) }, // Valid for 3 hours
        },
        select: { storeName: true,currencySign:true,orderItems: true,vendor: {
          select: { id: true, name: true, phoneNo: true },
        } },
      });
    }

    if (!order) {
      throw new NotFoundException('Invalid or expired driver code.');
    }

    return order;
  }

  // Update the order after validation and notify relevant parties
  async updateOrder(
    type: 'SERVICE_ORDER' | 'DELIVERY_ORDER',
    driverCode: string,
    updateData: { status: DeliveryOrderStatus & ServiceOrderStatus; notes?: string },
  ) {
    let updatedOrder;

    if (type === 'SERVICE_ORDER') {
      const allowedStatuses: ServiceOrderStatus[] = [
        ServiceOrderStatus.IN_PROGRESS,
        ServiceOrderStatus.COMPLETED,
      ];
      if (!allowedStatuses.includes(updateData.status as ServiceOrderStatus)) {
        throw new BadRequestException('Invalid status transition for Service Order.');
      }

      updatedOrder = await this.prisma.serviceOrder.update({
        where: { driverAccessCode: driverCode },
        data: updateData,
        include: { vendor: {
          select: { id: true, name: true, phoneNo: true },
        }},
      });

      await this.serviceOrdersService.notifyStatusChange(updatedOrder, updateData.status as ServiceOrderStatus);
    } else if (type === 'DELIVERY_ORDER') {
      const allowedStatuses: DeliveryOrderStatus[] = [
        DeliveryOrderStatus.ON_WAY,
        DeliveryOrderStatus.COMPLETED,
      ];
      if (!allowedStatuses.includes(updateData.status as DeliveryOrderStatus)) {
        throw new BadRequestException('Invalid status transition for Delivery Order.');
      }

      updatedOrder = await this.prisma.deliveryOrder.update({
        where: { driverAccessCode: driverCode },
        data: updateData,
        include: { vendor: {
          select: { id: true, name: true, phoneNo: true },
        } },
      });

      await this.deliveryOrdersService.notifyStatusChange(updatedOrder, updateData.status as DeliveryOrderStatus);
    } else {
      throw new NotFoundException('Invalid order type.');
    }

    return updatedOrder;
  }
}
