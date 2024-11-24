import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { QueryServiceOrdersDto, CreateServiceOrderDto, EditServiceOrderDto } from 'src/admin/dto/service-orders.dto';
import { ClientJwt } from 'src/auth/guard/clientJwt.guard';
import { GetUser } from 'src/auth/decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Service Orders')
@Controller('service-orders')
@UseGuards(ClientJwt)
@ApiBearerAuth()
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all service orders with pagination, sorting, and filtering' })
  async getServiceOrders(@Query() query: QueryServiceOrdersDto, @GetUser() user) {
    return this.serviceOrdersService.getServiceOrders(query, user.role, user.countryId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new service order' })
  async createServiceOrder(@Body() dto: CreateServiceOrderDto) {
    return this.serviceOrdersService.createServiceOrder(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a service order' })
  async editServiceOrder(@Param('id') id: number, @Body() dto: EditServiceOrderDto) {
    return this.serviceOrdersService.editServiceOrder(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service order' })
  async deleteServiceOrder(@Param('id') id: number) {
    return this.serviceOrdersService.deleteServiceOrder(id);
  }
}
