import { Body, Controller, Delete, Get, HttpStatus, Injectable, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/decorator/get-user.decorator';import { QueryServiceDto } from './dto/query-list.dto';
import { CreateServiceDto } from './dto/create-list.dto';
import { UpdateServiceDto } from './dto/update-list.dto';
import { ListService } from './list.service';
import { AdminJwt } from 'src/admin/auth/guard';


@UseGuards(AdminJwt)
@Controller('admin/services/list')
export class ListController {
  constructor(private readonly listService: ListService) {}
  
  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({ status: 200, description: 'List of services' })
  async findAll(@Query() query: QueryServiceDto, @GetUser() user) {
    return this.listService.findAll(query, user.role);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get service by slug' })
  @ApiParam({ name: 'slug', description: 'Service slug' })
  @ApiResponse({ status: 200, description: 'Service details' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findOne(@Param('slug') slug: string, @GetUser() user) {
    return this.listService.findOne(slug, user.role);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async create(@Body() createServiceDto: CreateServiceDto, @GetUser() user) {
    return this.listService.create(createServiceDto, user.role);
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Update an existing service' })
  @ApiParam({ name: 'slug', description: 'Service slug' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async update(
    @Param('slug') slug: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @GetUser() user,
  ) {
    return this.listService.update(slug, updateServiceDto, user.role);
  }

  @Delete(':slug')
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'slug', description: 'Service slug' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })

  async remove(@Param('slug') slug: string, @GetUser() user) {
    return this.listService.remove(slug, user.role);
  }
}
