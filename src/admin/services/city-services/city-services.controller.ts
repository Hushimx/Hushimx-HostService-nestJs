// import {
//     Controller,
//     Get,
//     Post,
//     Put,
//     Delete,
//     Param,
//     Query,
//     Body,
//     HttpCode,
//     HttpStatus,
//     ParseIntPipe,
//   } from '@nestjs/common';
//   import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
//   import { CityServiceVendorService } from './city-services.service';
//   import { ManageCityVendorDto } from '../../dto/services.dto';
  
//   @ApiTags('services/CityServiceVendors')
//   @Controller('city-service-vendors')
//   export class CityServiceVendorController {
//     constructor(private readonly cityServiceVendorService: CityServiceVendorService) {}
  
//     // Get all city-vendor links
//     @Get()
//     @ApiOperation({ summary: 'Get all city-vendor links' })
//     @ApiQuery({ name: 'userRole', required: true, description: 'Role of the user' })
//     @ApiQuery({ name: 'userCountryId', required: false, description: 'Country ID for filtering' })
//     @ApiQuery({ name: 'cityId', required: false, description: 'City ID for filtering' })
//     @ApiResponse({ status: HttpStatus.OK, description: 'List of city-vendor links' })
//     async findAll(
//       @Query('userRole') userRole: string,
//       @Query('userCountryId') userCountryId?: number,
//       @Query('cityId') cityId?: number,
//     ) {
//       return this.cityServiceVendorService.findAll(userRole, userCountryId, cityId);
//     }
  
//     // Add a city-vendor link
//     @Post(':serviceId')
//     @ApiOperation({ summary: 'Create a city-vendor link for a service' })
//     @ApiParam({ name: 'serviceId', description: 'Service ID' })
//     @ApiBody({ type: ManageCityVendorDto })
//     @ApiResponse({ status: HttpStatus.CREATED, description: 'City-vendor link created successfully' })
//     @ApiResponse({ status: HttpStatus.CONFLICT, description: 'City already linked to this service' })
//     async create(
//       @Param('serviceId', ParseIntPipe) serviceId: number,
//       @Body() dto: ManageCityVendorDto,
//     ) {
//       return this.cityServiceVendorService.create(serviceId, dto);
//     }
  
//     // Update a city-vendor link
//     @Put(':id')
//     @ApiOperation({ summary: 'Update a city-vendor link' })
//     @ApiParam({ name: 'id', description: 'City-Vendor link ID' })
//     @ApiBody({ type: ManageCityVendorDto })
//     @ApiResponse({ status: HttpStatus.OK, description: 'City-vendor link updated successfully' })
//     @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'City-Vendor link not found' })
//     async update(
//       @Param('id', ParseIntPipe) id: number,
//       @Body() dto: ManageCityVendorDto,
//     ) {
//       return this.cityServiceVendorService.update(id, dto);
//     }
  
//     // Delete a city-vendor link
//     @Delete(':id')
//     @ApiOperation({ summary: 'Delete a city-vendor link' })
//     @ApiParam({ name: 'id', description: 'City-Vendor link ID' })
//     @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'City-vendor link deleted successfully' })
//     @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'City-Vendor link not found' })
//     @HttpCode(HttpStatus.NO_CONTENT)
//     async remove(@Param('id', ParseIntPipe) id: number) {
//       return this.cityServiceVendorService.remove(id);
//     }
//   }
  