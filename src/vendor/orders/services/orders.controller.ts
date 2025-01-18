import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { GetUser } from 'src/decorator/get-user.decorator';import {  ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryServiceOrdersDto } from './dto/query-order.dto';
import { ServicesOrdersService } from './orders.service';
import { VendorJwt } from 'src/vendor/vendor-auth/guard/vendorJwt.guard';

@ApiTags('Service Orders')
@Controller('vendor/orders/service')
@UseGuards(VendorJwt)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ServicesOrdersService: ServicesOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all service orders with pagination, sorting, and filtering' })
  async getServiceOrders(@Query(new ValidationPipe({ transform: true, whitelist: true })) query: QueryServiceOrdersDto, @GetUser() user) {
    return this.ServicesOrdersService.getServiceOrders(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single service order by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.ServicesOrdersService.findOne(id, user);
  }



  // @Patch(':id')
  // @ApiOperation({ summary: 'Edit a service order' })
  // async editServiceOrder(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: UpdateServiceOrderDto,
  //   @GetUser() user,
  // ) {
  //   return this.ServicesOrdersService.editServiceOrder(id, dto, user.role);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete a service order' })
  // async deleteServiceOrder(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
  //   return this.ServicesOrdersService.deleteServiceOrder(id, user.role);
  // }

}
