import { Controller, Get, Patch, Delete, Query, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { QueryOrdersDto, EditOrderDto } from 'src/admin/dto/orders.dto';
import { GetUser } from 'src/auth/decorator';
import { ClientJwt } from 'src/auth/guard/clientJwt.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Prodcuts/Orders')
@Controller('orders')
@UseGuards(ClientJwt)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination, sorting, and filtering' })
  async getOrders(@Query() query: QueryOrdersDto, @GetUser() user) {
    return this.ordersService.getOrders(query, user.role, user.countryId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an order' })
  async editOrder(@Param('id',ParseIntPipe) id: number, @Body() dto: EditOrderDto) {
    return this.ordersService.editOrder(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  async deleteOrder(@Param('id',ParseIntPipe) id: number) {
    return this.ordersService.deleteOrder(id);
  }
}
