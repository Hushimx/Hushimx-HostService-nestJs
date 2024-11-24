import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { User } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async placeOrder(dto: PlaceOrderDto, user) {
    return this.prisma.$transaction(async (prisma) => {
      const userCityId = 1; 

      let initialTotal = 0;
      const orderItemsData = [];

      // Validate and prepare products
      for (const item of dto.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { vendor: true },
        });
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
        if (product.cityId !== userCityId) {
          throw new BadRequestException(`Product ${product.name} is not available in your city`);
        }
        const itemTotalPrice = product.price * item.quantity;
        initialTotal += itemTotalPrice;

        orderItemsData.push({
          productId: item.productId,
          vendorId: product.vendorId,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Create the order
      const order = await prisma.order.create({
        data: {
          clientId: user.clientId,
          cityId: userCityId,
          roomId: user.roomId,
          status: 'PENDING',
          total: initialTotal,
          orderItems: { create: orderItemsData },
        },
        include: { orderItems: true },
      });

      return { message: 'Order placed successfully', order };
    });
  }

  async getAllOrders(clientId: number) {
    return this.prisma.order.findMany({
      where: { clientId },
      include: { orderItems: true },
    });
  }

  async getOrderById(orderId: string, clientId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: parseInt(orderId), clientId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(orderId: string, clientId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: parseInt(orderId), clientId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be canceled');
    }

    return this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELED' },
    });
  }
}
