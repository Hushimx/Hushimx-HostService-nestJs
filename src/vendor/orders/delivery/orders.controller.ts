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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GetUser } from 'src/decorator/get-user.decorator';
import { VendorJwt } from 'src/vendor/vendor-auth/guard/vendorJwt.guard';
import { QueryOrdersDto } from './dto/delivery-orders.dto';

@ApiTags('Orders')
@Controller('vendor/orders/delivery')
@ApiBearerAuth()
@UseGuards(VendorJwt)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders with filtering, pagination, and sorting' })
  async getOrders(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: QueryOrdersDto,
    @GetUser() user: any,
  ) {
    console.log(query,"query")
    return this.ordersService.getOrders(query, user);
  }
  @Get(":id")
  @ApiOperation({ summary: 'Get an order by ID' })
  async getOrder(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
  ) {
    return this.ordersService.getOrder(id, user);
  }


}
