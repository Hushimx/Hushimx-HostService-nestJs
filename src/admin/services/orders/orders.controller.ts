import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import {  ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwt } from 'src/auth/guard';
import { QueryServiceOrdersDto } from './dto/query-order.dto';
import { UpdateServiceOrderDto } from './dto/update-order.dto';
import { ServicesOrdersService } from './orders.service';

@ApiTags('Service Orders')
@Controller('admin/services/orders')
@UseGuards(AdminJwt)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ServicesOrdersService: ServicesOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all service orders with pagination, sorting, and filtering' })
  async getServiceOrders(@Query(new ValidationPipe({ transform: true, whitelist: true })) query: QueryServiceOrdersDto, @GetUser() user) {
    return this.ServicesOrdersService.getServiceOrders(query, user.role, user.countryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single service order by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.ServicesOrdersService.findOne(id, user.role);
  }



  @Patch(':id')
  @ApiOperation({ summary: 'Edit a service order' })
  async editServiceOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceOrderDto,
    @GetUser() user,
  ) {
    return this.ServicesOrdersService.editServiceOrder(id, dto, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service order' })
  async deleteServiceOrder(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.ServicesOrdersService.deleteServiceOrder(id, user.role);
  }

}
