import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeliveryOrderStatus, ServiceOrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { WwebjsService } from 'src/wwebjs/wwebjs.service';

@Injectable()
export class OrderManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WwebjsService,
  ) {}

  /**
   * Assign a driver to the order and notify the driver.
   */
  async assignDriver(
    type: 'SERVICE_ORDER' | 'DELIVERY_ORDER',
    orderId: number,
    driverId: number,
  ) {
    // Fetch and validate the driver
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: { id: true, cityId: true, phoneNo: true },
    });
    if (!driver) throw new BadRequestException('Driver not found.');

    // Fetch and validate the order
    const order = await this.getOrder(type, orderId);
    if (driver.cityId !== order.cityId) {
      throw new BadRequestException('Driver must be in the same city as the order.');
    }

    // Prepare the driver message based on order type
    const driverMessage = this.getDriverMessage(type, order);

    // Notify the driver before proceeding
    try {
      const driverNotificationSuccess = await this.safeSendMessage(driver.phoneNo, driverMessage);
      if (!driverNotificationSuccess) {
        throw new InternalServerErrorException('Failed to notify the driver. Operation aborted.');
      }
    } catch (error) {
      console.error(`Driver notification failed for ${driver.phoneNo}: ${error.message}`);
      throw new InternalServerErrorException('Failed to notify the driver. Operation aborted.');
    }

    // Update the order status to PICKUP and assign the driver
    const updatedOrder = await this.updateOrderStatus(
      type,
      orderId,
      type === 'SERVICE_ORDER' ? ServiceOrderStatus.PICKUP : DeliveryOrderStatus.PICKUP,
      driver.id,
    );

    // Notify other stakeholders about the status change
    await this.notifyStatusChange(type, updatedOrder.id, updatedOrder.status);

    return updatedOrder;
  }

  /**
   * Notify all relevant stakeholders when the order status changes.
   */
  async notifyStatusChange(
    type: 'SERVICE_ORDER' | 'DELIVERY_ORDER',
    orderId: number,
    newStatus: DeliveryOrderStatus | ServiceOrderStatus,
  ) {
    const order = await this.getOrder(type, orderId);
    const messages = this.getStatusMessages(order.id, newStatus);

    // Notify the client (fails gracefully)
    const clientNotificationSuccess = await this.safeSendMessage(order.clientNumber, messages.client);
    if (!clientNotificationSuccess) {
      console.warn('Failed to notify client, but proceeding with the rest of the operation.');
    }

    // Notify the vendor
    if (['PICKUP', 'CANCELED', 'COMPLETED'].includes(newStatus) && order.vendor?.phoneNo) {
      const vendorNotificationSuccess = await this.safeSendMessage(order.vendor.phoneNo, messages.vendor);
      if (!vendorNotificationSuccess) {
        throw new InternalServerErrorException('Failed to notify vendor. Operation aborted.');
      }
    }

    // Notify the driver for CANCELED or COMPLETED statuses
    if (['CANCELED', 'COMPLETED'].includes(newStatus) && order.driver?.phoneNo) {
      const driverNotificationSuccess = await this.safeSendMessage(order.driver.phoneNo, messages.driver);
      if (!driverNotificationSuccess) {
        throw new InternalServerErrorException('Failed to notify driver. Operation aborted.');
      }
    }

    // Update the order status
    return this.updateOrderStatus(type, orderId, newStatus);
  }

  /**
   * Fetch order details based on its type.
   */
  private async getOrder(type: 'SERVICE_ORDER' | 'DELIVERY_ORDER', orderId: number) {
    const includeRelations = {
      city: true,
      vendor: true, // Ensure vendor relation is included
      driver: true, // Ensure driver relation is included
      hotel: true,
    };
  
    if (type === 'SERVICE_ORDER') {
      return this.prisma.serviceOrder.findUnique({
        where: { id: orderId },
        include: {
          ...includeRelations,
          service: true, // Include service provider details for service orders
        },
      });
    }
    return this.prisma.deliveryOrder.findUnique({
      where: { id: orderId },
      include: {
        ...includeRelations,
        store: true, // Include store details for delivery orders
      },
    });
  }
  
  /**
   * Generate a custom driver message based on order type.
   */
  private getDriverMessage(type: 'SERVICE_ORDER' | 'DELIVERY_ORDER', order: any): string {
    const hotelDetails = `الفندق: ${order.hotel?.name || 'غير متوفر'}\nالعنوان: ${order.hotel?.address || 'غير متوفر'}\nالغرفة: ${order.roomNumber}`;

    if (type === 'DELIVERY_ORDER') {
      return `تم تعيينك لتوصيل الطلب رقم ${order.id}.\n\nيرجى أخذ الطلب من المتجر التالي:\nالمتجر: ${order.store?.name || 'غير متوفر'}\nالعنوان: ${order.store?.address || 'غير متوفر'}\n\nثم توصيله إلى:\n${hotelDetails}`;
    } else if (type === 'SERVICE_ORDER') {
      return `تم تعيينك لتوصيل الطلب الخدمي رقم ${order.id}.\n\nيرجى أخذ الأدوات/المنتجات المطلوبة وتوصيلها إلى مقدم الخدمة:\nالخدمة: ${order.serviceProvider?.name || 'غير متوفر'}\nالعنوان: ${order.serviceProvider?.address || 'غير متوفر'}\n\nتفاصيل الفندق:\n${hotelDetails}`;
    }
    return '';
  }

  /**
   * Update order with driver assignment and status.
   */
  private async updateOrderStatus(
    type: 'SERVICE_ORDER' | 'DELIVERY_ORDER',
    orderId: number,
    status: ServiceOrderStatus | DeliveryOrderStatus,
    driverId?: number,
  ) {
    const updateData: any = { status };

    // Add driver assignment if provided
    if (driverId) {
      updateData.driverId = driverId;
    }

    if (type === 'SERVICE_ORDER') {
      if (!Object.values(ServiceOrderStatus).includes(status as ServiceOrderStatus)) {
        throw new BadRequestException(`Invalid status for Service Order: ${status}`);
      }
      return this.prisma.serviceOrder.update({
        where: { id: orderId },
        data: updateData,
      });
    } else if (type === 'DELIVERY_ORDER') {
      if (!Object.values(DeliveryOrderStatus).includes(status as DeliveryOrderStatus)) {
        throw new BadRequestException(`Invalid status for Delivery Order: ${status}`);
      }
      return this.prisma.deliveryOrder.update({
        where: { id: orderId },
        data: updateData,
      });
    }

    throw new BadRequestException('Invalid order type provided.');
  }

  /**
   * Generate localized messages for stakeholders based on the status.
   */
  private getStatusMessages(orderId: number, status: any) {
    const baseMessages = {
      PENDING: `الطلب رقم ${orderId} قيد الانتظار.\nOrder ${orderId} is pending.`,
      PICKUP: `الطلب رقم ${orderId} قيد الالتقاط.\nOrder ${orderId} is being picked up.`,
      ON_WAY: `الطلب رقم ${orderId} في الطريق.\nOrder ${orderId} is on the way.`,
      IN_PROGRESS: `الطلب رقم ${orderId} قيد التنفيذ.\nOrder ${orderId} is in progress.`,
      COMPLETED: `تم إكمال الطلب رقم ${orderId}.\nOrder ${orderId} has been completed.`,
      CANCELED: `تم إلغاء الطلب رقم ${orderId}.\nOrder ${orderId} has been canceled.`,
    };

    return {
      client: baseMessages[status],
      vendor:
        status === 'PICKUP'
          ? `الطلب رقم ${orderId} جاهز للاستلام.\nOrder ${orderId} is ready for pickup.`
          : baseMessages[status],
      driver: baseMessages[status],
    };
  }

  /**
   * Send WhatsApp messages safely (return success or failure).
   */
  private async safeSendMessage(phoneNo: string, message: string): Promise<boolean> {
    try {
      await this.whatsappService.sendMessage(phoneNo, message);
      return true;
    } catch (error) {
      console.error(`Failed to send WhatsApp message to ${phoneNo}: ${error.message}`);
      return false;
    }
  }
}
