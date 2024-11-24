import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlaceServiceOrderDto } from './dto/place-service-order.dto';
import { Client } from '@prisma/client';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  // Get service details by slug
  async getService(slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug },
    });

    if (!service) {
      throw new NotFoundException(`Service with slug "${slug}" not found`);
    }

    return {
      name: service.name,
      description: service.description,
      price: 0,
    };
  }

  // Place a new service order
  async placeServiceOrder(dto: PlaceServiceOrderDto, client) {
    return this.prisma.$transaction(async (prisma) => {
      const cityVendorService = await prisma.cityServiceVendor.findFirst({
        where: {
          service: { slug: dto.slug },
          cityId: client.cityId,
        },
        include: {
          service: true,
          vendor: true,
        },
      });

      if (!cityVendorService) {
        throw new NotFoundException(`Service not available in the specified city`);
      }

      const totalCost =  0.0;

      // Create the service order with the city-specific vendor
      const serviceOrder = await prisma.serviceOrder.create({
        data: {
          clientId: client.id,
          serviceId: cityVendorService.service.id,
          vendorId: cityVendorService.vendor.id,
          notes: dto.notes,
          status: 'PENDING',
          total: totalCost,
        },
      });

      return { message: 'Service order placed successfully', serviceOrder };
    });
  }

  // Cancel a service order by ID if it is still pending
  async cancelServiceOrder(orderId: string, clientId: number) {
    const serviceOrder = await this.prisma.serviceOrder.findFirst({
      where: { id: parseInt(orderId), clientId },
    });

    if (!serviceOrder) {
      throw new NotFoundException('Service order not found');
    }
    if (serviceOrder.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be canceled');
    }

    // Update the order status to CANCELED
    return this.prisma.serviceOrder.update({
      where: { id: serviceOrder.id },
      data: { status: 'CANCELED' },
    });
  }

  // Get service order details by ID
  async getServiceOrderDetails(orderId: string, clientId: number) {
    const serviceOrder = await this.prisma.serviceOrder.findFirst({
      where: { id: parseInt(orderId), clientId },
      include: {
        service: true,
        vendor: true,
      },
    });

    if (!serviceOrder) {
      throw new NotFoundException('Service order not found');
    }

    return serviceOrder;
  }
}
