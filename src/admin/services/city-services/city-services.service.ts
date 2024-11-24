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
//     UseGuards,
//   } from '@nestjs/common';
//   import { CityServiceVendorsService } from './city-service-vendors.service';
//   import { ManageCityVendorDto } from '../dto/services.dto';
//   import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
  
//   @ApiTags('CityServiceVendors')
//   @Controller('city-service-vendors')
//   export class CityServiceVendorsController {
//     constructor(private readonly cityServiceVendorsService: CityServiceVendorsService) {}
  
//     // Get city vendors by service slug
//     @Get(':slug')
//     @ApiOperation({ summary: 'Get city vendors by service slug' })
//     @ApiParam({ name: 'slug', description: 'Service slug' })
//     @ApiQuery({ name: 'userRole', required: true, description: 'Role of the user' })
//     @ApiQuery({ name: 'userCountryId', required: false, description: 'Country ID for regional admin' })
//     @ApiResponse({ status: HttpStatus.OK, description: 'List of city vendors' })
//     async findCityVendorsByServiceSlug(
//       @Param('slug') slug: string,
//       @Query('userRole') userRole: string,
//       @Query('userCountryId') userCountryId?: number,
//     ) {
//       return this.cityServiceVendorsService.findCityVendorsByServiceSlug(slug, userRole, userCountryId);
//     }
  
//     // Add a city vendor link
//     @Post(':serviceId')
//     @ApiOperation({ summary: 'Add a city vendor link' })
//     @ApiParam({ name: 'serviceId', description: 'Service ID' })
//     @ApiBody({ type: ManageCityVendorDto })
//     @ApiResponse({ status: HttpStatus.CREATED, description: 'City vendor link created successfully' })
//     async addCityVendor(
//       @Param('serviceId', ParseIntPipe) serviceId: number,
//       @Body() manageCityVendorDto: ManageCityVendorDto,
//       @Query('userRole') userRole: string,
//       @Query('userCountryId') userCountryId?: number,
//     ) {
//       return this.cityServiceVendorsService.addCityVendor(serviceId, manageCityVendorDto, userRole, userCountryId);
//     }
  
//     // Update a city vendor link
//     @Put(':id')
//     @ApiOperation({ summary: 'Update a city vendor link' })
//     @ApiParam({ name: 'id', description: 'CityVendor link ID' })
//     @ApiBody({ type: ManageCityVendorDto })
//     @ApiResponse({ status: HttpStatus.OK, description: 'City vendor link updated successfully' })
//     async updateCityVendor(
//       @Param('id', ParseIntPipe) id: number,
//       @Body() manageCityVendorDto: ManageCityVendorDto,
//       @Query('userRole') userRole: string,
//       @Query('userCountryId') userCountryId?: number,
//     ) {
//       return this.cityServiceVendorsService.updateCityVendor(id, manageCityVendorDto, userRole, userCountryId);
//     }
  
//     // Delete a city vendor link
//     @Delete(':id')
//     @ApiOperation({ summary: 'Delete a city vendor link' })
//     @ApiParam({ name: 'id', description: 'CityVendor link ID' })
//     @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'City vendor link deleted successfully' })
//     @HttpCode(HttpStatus.NO_CONTENT)
//     async removeCityVendor(
//       @Param('id', ParseIntPipe) id: number,
//       @Query('userRole') userRole: string,
//       @Query('userCountryId') userCountryId?: number,
//     ) {
//       return this.cityServiceVendorsService.removeCityVendor(id, userRole, userCountryId);
//     }
//   }
  