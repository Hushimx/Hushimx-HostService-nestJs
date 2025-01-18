import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { DeliveryOrderStatus, Admin } from '@prisma/client';
import { paginateAndSort } from 'src/utils/pagination';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async placeOrder(dto: PlaceOrderDto, user, userCityId?: number) {
    return this.prisma.$transaction(
      async (prisma) => {
        // Determine the user's city ID dynamically
        const cityId = userCityId || user.cityId;
        if (!cityId) {
          throw new BadRequestException('City ID is required.');
        }
  
        // Fetch the store and verify it belongs to the user's city
        const store = await prisma.store.findUnique({
          where: { uuid: dto.store },
          include: { vendor: true },
        });
  
        if (!store) {
          throw new NotFoundException('Store not found.');
        }
  
        if (store.cityId !== cityId) {
          throw new BadRequestException('The selected store is not available in your city.');
        }
  
        // Fetch the payment method
        const paymentMethod = await prisma.paymentMethod.findUnique({
          where: { name: dto.paymentMethod },
        });
  
        if (!paymentMethod) {
          throw new NotFoundException('Payment method not found.');
        }
  
        // Fetch client details
        const client = await prisma.client.findUnique({
          where: { id: user.clientId },
          select: { phoneNo: true },
        });
  
        if (!client) {
          throw new NotFoundException('Client not found.');
        }
  
        let totalAmount = 0;
  
        // Validate products and ensure they belong to the store
        const orderItemsData = await Promise.all(
          dto.items.map(async (item) => {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
            });
  
            if (!product) {
              throw new NotFoundException(`Product with ID ${item.productId} not found.`);
            }
  
            if (product.storeId !== store.id) {
              throw new BadRequestException(
                `Product "${product.name}" does not belong to the selected store.`
              );
            }
  
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;
  
            return {
              productId: product.id,
              productTitle: product.name,
              quantity: item.quantity,
              price: product.price,
            };
          })
        );
  
        // Determine the initial order status
        const orderStatus: DeliveryOrderStatus =
          paymentMethod.type === 'offline' ? 'PENDING' : 'PENDING';
  
        // Create the order
        const order = await prisma.deliveryOrder.create({
          data: {
            clientId: user.clientId,
            cityId: cityId,
            roomId: user.roomId,
            hotelId: user.hotelId,
            vendorId: store.vendor.id,
            storeId: store.id,
            storeName: store.name,
            currencySign: user.currencySign,
            clientName: "clientName",
            clientNumber: client.phoneNo ,
            roomNumber: "11" ,
            hotelName: user.hotelName,
            status: orderStatus,
            total: totalAmount,
            paymentMethod: paymentMethod.name,
            orderItems: { create: orderItemsData },
          },
        });
  
        // Return the order ID for client confirmation
        return {
          message: 'Order placed successfully.',
          orderId: order.id,
        };
      },
      {
        maxWait: 10000, // Maximum wait for transaction to start
        timeout: 30000, // Timeout for transaction execution
      }
    );
  }
  
  
  

  async getAllOrders(clientId: number) {
    return this.prisma.deliveryOrder.findMany({
      where: { clientId },
      select: {
        storeName: true,
        createdAt: true,
        currencySign: true,
        status: true,
        total: true,
      },
        });


  }

  async getOrderById(orderId: string, clientId: number) {
    const order = await this.prisma.deliveryOrder.findFirst({
      where: { id: parseInt(orderId), clientId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      date: order.createdAt,
      status: order.status,
      total: order.total,
      paymentMethod: order.paymentMethod,
      client: {
        name: order.clientName,
        phoneNumber: order.clientNumber,
      },
      room: {
        name: order.roomNumber,
      },
      hotel: {
        name: order.hotelName,
      },
      store: {
        slug: order.id,
      },
      notes: order.notes,
      items: order.orderItems.map((item) => ({
        id: item.id,
        name: item.productTitle,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      })),
    };
  }

  async cancelOrder(orderId: string, clientId: number) {
    const order = await this.prisma.deliveryOrder.findFirst({
      where: { id: parseInt(orderId), clientId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be canceled');
    }

    return this.prisma.deliveryOrder.update({
      where: { id: order.id },
      data: { status: 'CANCELED' },
    });
  }
}
