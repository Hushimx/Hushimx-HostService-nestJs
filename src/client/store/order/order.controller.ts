

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { GetUser } from 'src/decorator/get-user.decorator';
import {  Admin } from '@prisma/client';
import { ClientJwt } from 'src/client/guard/clientJwt.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(ClientJwt)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Place a new product order' })
  @ApiResponse({
    status: 201,
    description: 'Order placed successfully',
    schema: {
      example: {
        message: 'Order placed successfully',
        data: {
          id: 123,

        },
      },
    },
  })
  @ApiBody({
    type: PlaceOrderDto,
    examples: {
      exampleOrder: {
        summary: 'Example Order with Products',
        value: {
          items: [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 },
          ],
          paymentMethod: 'card',
        },
      },
    },
  })
  async placeOrder(@Body() dto: PlaceOrderDto, @GetUser() user: Admin) {
    return this.orderService.placeOrder(dto, user);
  }

  @UseGuards(ClientJwt)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all product orders for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
    schema: {
      example: [
        {
          id: 123,
          userId: 1,
          cityId: 5,
          status: 'PENDING',
          total: 130.0,
        },
      ],
    },
  })
  async getAllOrders(@GetUser() user: Admin) {
    return this.orderService.getAllOrders(user.id);
  }

  @UseGuards(ClientJwt)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific product order' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the order to retrieve',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Order details with items',
    schema: {
      example: {
        id: 123,
        userId: 1,
        cityId: 5,
        status: 'PENDING',
        total: 130.0,
        orderItems: [
          { productId: 1, quantity: 2, price: 50.0 },
          { productId: 2, quantity: 1, price: 30.0 },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Param('id',ParseIntPipe) orderId: string, @GetUser() user: Admin) {
    return this.orderService.getOrderById(orderId, user.id);
  }

  @UseGuards(ClientJwt)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a product order if it is still pending' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the order to cancel',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    schema: {
      example: {
        message: 'Order cancelled successfully',
        orderId: 1,
        status: 'CANCELED',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({
    status: 400,
    description: 'Order cannot be canceled',
    schema: {
      example: {
        message: 'Only pending orders can be canceled',
      },
    },
  })
  async cancelOrder(@Param('id',ParseIntPipe) orderId: string, @GetUser() user: Admin) {
    return this.orderService.cancelOrder(orderId, user.id);
  }
}
