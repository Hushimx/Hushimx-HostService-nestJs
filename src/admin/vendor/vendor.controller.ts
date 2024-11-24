import { Controller, Get, Post, Body, Param, Patch, Delete, Query, Req } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto, QueryVendorDto, UpdateVendorDto } from 'src/admin/dto/vendor.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createVendorDto: CreateVendorDto, @Req() req: any) {
    return this.vendorService.create(createVendorDto, req.user.role, req.user.countryId);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of vendors' })
  @ApiQuery({ name: 'countryId', required: false, description: 'Filter by country ID (Super Admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sortField', required: false, description: 'Field to sort by', example: 'name' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sorting order', example: 'asc', enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of vendors retrieved successfully.' })
  async findAll(@Query() query: QueryVendorDto, @Req() req: any) {
    return this.vendorService.findAll(query, req.user.role, req.user.countryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific vendor' })
  @ApiResponse({ status: 200, description: 'Vendor details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.vendorService.findOne(parseInt(id, 10), req.user.role, req.user.countryId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor successfully updated.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
    @Req() req: any,
  ) {
    return this.vendorService.update(parseInt(id, 10), updateVendorDto, req.user.role, req.user.countryId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.vendorService.remove(parseInt(id, 10), req.user.role, req.user.countryId);
  }
}
