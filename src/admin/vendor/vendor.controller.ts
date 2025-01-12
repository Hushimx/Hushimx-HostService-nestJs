import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Req,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto, QueryVendorDto, UpdateVendorDto } from 'src/admin/dto/vendor.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwt } from 'src/auth/guard';

@ApiTags('Vendors')
@Controller('admin/vendors')
@UseGuards(AdminJwt)
@ApiBearerAuth()
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor successfully created.' })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) createVendorDto: CreateVendorDto,
    @Req() req: any,
  ) {
    return this.vendorService.create(createVendorDto, req.user.role, req.user.countryId);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of vendors with pagination, sorting, and filtering' })
  @ApiResponse({ status: 200, description: 'List of vendors retrieved successfully.' })
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: QueryVendorDto,
    @Req() req: any,
  ) {
    return this.vendorService.findAll(query, req.user.role, req.user.countryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific vendor' })
  @ApiResponse({ status: 200, description: 'Vendor details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.vendorService.findOne(id, req.user.role, req.user.countryId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor successfully updated.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) updateVendorDto: UpdateVendorDto,
    @Req() req: any,
  ) {
    return this.vendorService.update(id, updateVendorDto, req.user.role, req.user.countryId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.vendorService.remove(id, req.user.role, req.user.countryId);
  }
}
