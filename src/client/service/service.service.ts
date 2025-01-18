import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlaceServiceOrderDto } from './dto/place-service-order.dto';
import { Client } from '@prisma/client';
import { UUID } from 'crypto';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  // Get service details by slug
  async getService(slug: string, userCity: number) {
    const serviceVendor = await this.prisma.cityServiceVendor.findFirst({
      relationLoadStrategy: 'join',
      where: {
        service: { slug:slug },
        cityId: userCity,
      },
      include: {
        service: true, // Include service details
      },
    });
  
    if (!serviceVendor) {
      throw new NotFoundException(
        `No vendors found for service "${slug}" in city "${userCity}"`
      );
    }
  
    return {
      serviceName: serviceVendor.service.name,
      description: serviceVendor.service.description,
      vendor: {
        description: serviceVendor.description,
        description_ar: serviceVendor.description_ar,
      }

    };
  }

  // Place a new service order
async placeServiceOrder(dto: PlaceServiceOrderDto, clientJwt) {
  return this.prisma.$transaction(async (prisma) => {
    // Check for an existing order
    const existingOrder = await prisma.serviceOrder.findFirst({
      where: {
        clientId: clientJwt.id,
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
    });

    if (existingOrder) {
      throw new BadRequestException({
        code: 'ONGOING_SERVICE_ORDER',
        message: 'An ongoing service order already exists.',
      });
    }

    const client = await this.prisma.client.findUnique({
      where: {
        id: clientJwt.clientId,
      },
    })
    if(!client){
      throw new NotFoundException({
        code: 'CLIENT_NOT_FOUND',
        message: 'Client not found.',
      });
    }

    // Check service availability in the client's city
    const cityVendorService = await prisma.cityServiceVendor.findFirst({
      where: {
        service: { slug: dto.slug },
        cityId: clientJwt.cityId,
      },
      include: {
        service: true,
        vendor: true,
      },
    });

    if (!cityVendorService) {
      throw new NotFoundException({
        code: 'SERVICE_NOT_AVAILABLE',
        message: 'Service not available in the specified city.',
      });
    }

    
    // Assume service and vendor details are valid
    const serviceName = cityVendorService.service.name;
    const vendorName = cityVendorService.vendor.name;
    const clientName = client.name;
    const clientNumber = client.phoneNo;
    const roomNumber = clientJwt.roomNumber;
    const hotelName = clientJwt.hotelName ;
    // Create the service order
    const serviceOrder = await prisma.serviceOrder.create({
      data: {
        clientId: clientJwt.clientId,
        serviceId: cityVendorService.service.id,
        vendorId: cityVendorService.vendor.id,
        cityId: clientJwt.cityId,
        hotelId: clientJwt.hotelId ,
        roomId: clientJwt.roomId ,
        driverId: null, // Optional, set if driver info is available
        serviceName,
        vendorName,
        clientName: "no name",
        clientNumber,
        roomNumber,
        hotelName,
        currencySign: 'SAR',
        notes: dto.notes,
        status: 'PENDING',
        total: 0,
      },
      select: {
        uuid: true,
      },
    });

    return {
      message: 'Service order placed successfully.',
      serviceOrder,
    };
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
    console.log(orderId,clientId)
    const serviceOrder = await this.prisma.serviceOrder.findFirst({
      where: { id: parseInt(orderId), },
      include: {
        service: true,
        vendor: {
          select: {
            name: true,

          }
        },
      },
    });

    if (!serviceOrder) {
      throw new NotFoundException('Service order not found');
    }

    return serviceOrder;
  }
  async getOrders(clientId: number) {
    const serviceOrders = await this.prisma.serviceOrder.findMany({
      where: { clientId },
      include: {
        service: true,
        vendor: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!serviceOrders || serviceOrders.length === 0) {
      throw new NotFoundException('No service orders found');
    }

    return serviceOrders;
  }
}


