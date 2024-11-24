import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    Body,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common';
  import { ApiTags, ApiResponse, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
  import { ServiceService } from './services.service';
  import { CreateServiceDto, UpdateServiceDto, ManageCityVendorDto, QueryServiceDto } from '../dto/services.dto';
  
  @ApiTags('Services')
  @Controller('services')
  export class ServiceController {
    constructor(private readonly serviceService: ServiceService) {}
  
    // Get all services
    @Get()
    @ApiOperation({ summary: 'Get all services with pagination and sorting' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of results per page' })
    @ApiQuery({ name: 'sortField', required: false, description: 'Field to sort by' })
    @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order: ASC or DESC' })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of services' })
    async findAll(@Query() query: QueryServiceDto) {
      return this.serviceService.findAll(query);
    }
  
    // Get a single service by slug
    @Get(':slug')
    @ApiOperation({ summary: 'Get a single service by its slug' })
    @ApiParam({ name: 'slug', description: 'Service slug' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Service details' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
    async findOne(@Param('slug') slug: string) {
      return this.serviceService.findOne(slug);
    }
  
    // Create a new service
    @Post()
    @ApiOperation({ summary: 'Create a new service' })
    @ApiBody({ type: CreateServiceDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Service created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request data' })
    async create(@Body() createServiceDto: CreateServiceDto) {
      return this.serviceService.create(createServiceDto);
    }
  
    // Update an existing service
    @Put(':slug')
    @ApiOperation({ summary: 'Update an existing service by its slug' })
    @ApiParam({ name: 'slug', description: 'Service slug' })
    @ApiBody({ type: UpdateServiceDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Service updated successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
    async update(@Param('slug') slug: string, @Body() updateServiceDto: UpdateServiceDto) {
      return this.serviceService.update(slug, updateServiceDto);
    }
  
    // Delete a service
    @Delete(':slug')
    @ApiOperation({ summary: 'Delete a service by its slug' })
    @ApiParam({ name: 'slug', description: 'Service slug' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Service deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('slug') slug: string) {
      return this.serviceService.remove(slug);
    }
  
  }
  