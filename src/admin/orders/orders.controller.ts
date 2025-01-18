import {
  Controller,
  Get,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { QueryOrdersDto, EditOrderDto } from 'src/admin/dto/orders.dto';
import { GetUser } from 'src/decorator/get-user.decorator';import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminJwt } from 'src/admin/auth/guard';

@ApiTags('Orders')
@Controller('admin/orders')
@ApiBearerAuth()
@UseGuards(AdminJwt)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders with filtering, pagination, and sorting' })
  async getOrders(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: QueryOrdersDto,
    @GetUser() user: any,
  ) {
    return this.ordersService.getOrders(query, user.role, user.countryId);
  }
  @Get(":id")
  @ApiOperation({ summary: 'Get an order by ID' })
  async getOrder(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
  ) {
    return this.ordersService.getOrder(id, user.role, user.countryId);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Edit an order' })
  async editOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: EditOrderDto,
    @GetUser() user: any,
  ) {
    return this.ordersService.editOrder(id, dto, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  async deleteOrder(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
  ) {
    return this.ordersService.deleteOrder(id, user.role);
  }
}
