import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { PlaceServiceOrderDto } from './dto/place-service-order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ClientJwt } from '../auth/guard/clientJwt.guard';
import { GetUser } from '../auth/decorator';
import { Client } from '@prisma/client';

@UseGuards(ClientJwt)
@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // Get all service orders
  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all service orders for the authenticated client' })
  @ApiResponse({
    status: 200,
    description: 'All service orders retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          clientId: 1,
          serviceId: 5,
          vendorId: 3,
          notes: 'Urgent cleaning service',
          status: 'PENDING',
          total: 50.0,
          createdAt: '2024-01-01T12:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z',
          service: {
            name: 'Laundry Service',
            description: 'Professional laundry service',
          },
          vendor: {
            name: 'Quick Laundry',
          },
        },
      ],
    },
  })
  async getServiceOrders(@GetUser() client: Client) {
    return this.serviceService.getOrders(client.id);
  }

  // Get service order details by ID
  @Get('orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get service order details by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the service order', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Service order details retrieved successfully',
    schema: {
      example: {
        id: 123,
        clientId: 1,
        serviceId: 5,
        vendorId: 3,
        notes: 'Urgent cleaning service',
        status: 'PENDING',
        total: 50.0,
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  async getServiceOrderDetails(@Param('id') orderId: string, @GetUser() client: Client) {
    return this.serviceService.getServiceOrderDetails(orderId, client.id);
  }

  // Place a new service order
  @Post('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a new service order' })
  @ApiBody({
    type: PlaceServiceOrderDto,
    examples: {
      exampleOrder: {
        summary: 'Example Service Order',
        value: {
          slug: 'laundry-service',
          notes: 'Please complete by end of day',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Service order placed successfully',
    schema: {
      example: {
        message: 'Service order placed successfully',
        serviceOrder: {
          id: 123,
          clientId: 1,
          serviceId: 5,
          vendorId: 3,
          notes: 'Urgent cleaning service',
          status: 'PENDING',
          total: 50.0,
          createdAt: '2024-01-01T12:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z',
        },
      },
    },
  })
  async placeServiceOrder(@Body() dto: PlaceServiceOrderDto, @GetUser() client: Client) {
    return this.serviceService.placeServiceOrder(dto, client);
  }

  // Cancel a service order by ID
  @Delete('orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a service order by ID if it is still pending' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the service order to cancel', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Service order canceled successfully',
    schema: {
      example: { message: 'Service order canceled successfully', orderId: 123, status: 'CANCELED' },
    },
  })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  @ApiResponse({ status: 400, description: 'Order cannot be canceled if not pending' })
  async cancelServiceOrder(@Param('id') orderId: string, @GetUser() client: Client) {
    return this.serviceService.cancelServiceOrder(orderId, client.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get service details by slug' })
  @ApiParam({ name: 'slug', required: true, description: 'Slug of the service to retrieve', example: 'laundry-service' })
  @ApiResponse({
    status: 200,
    description: 'Service details retrieved successfully',
    schema: {
      example: {
        name: 'Laundry Service',
        description: 'Professional laundry services',
        servicePrices: [
          {
          title: 'Regular Laundry',
          price: 10.0,
        }],
      },
    },
  })
  async getService(@Param('slug') slug: string,@GetUser() user) {
    return this.serviceService.getService(slug,user.cityId);
  }
}
