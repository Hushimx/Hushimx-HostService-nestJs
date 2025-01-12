import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ValidationPipe, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CitiesService } from './cities.service';
import {  CreateCityServiceDto } from './dto/create-city.dto';
import {  UpdateCityServiceDto } from './dto/update-city.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator';
import { QueryCityServiceDto } from './dto/query-city.dto';
import { DefaultApiErrors } from 'src/admin/decorator';
import { AdminJwt } from 'src/auth/guard';


@DefaultApiErrors()
@UseGuards(AdminJwt)
@Controller('admin/services/cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}
  
    @Get()
    @ApiOperation({ summary: 'Get all vendors for a service' })
    @ApiResponse({ status: 200, description: 'List of City Services' })
    async findAll(@Query(new ValidationPipe({ transform: true, whitelist: true, })) query :  QueryCityServiceDto,@GetUser() user) {
      return this.citiesService.findAll(query, user.role,user.countryId);
    }


    @Get(":id")
    
    @ApiOperation({ summary: 'Get City Service With the ID you\'ve sent' })
    @ApiResponse({ status: 200, description: 'Get one city service' })
    @ApiResponse({ status: 404, example:{
      code:"CITY_NOT_FOUND",
      message:"City not found"
    },description: 'No cities found with cityId you\'ve sent' })

    async findOne(@Param("id",ParseIntPipe) id : number , @GetUser() user) {
      return this.citiesService.findOne(id,user.role,user.countryId)
    }

    @Post()
    @ApiOperation({ summary: 'Add a vendor to a service in a city' })
    @ApiResponse({ status: 201, description: 'Vendor added successfully' })
    @ApiResponse({ status: 404, example:{
      code:"SERVICE_NOT_FOUND",
      message:"Couldn't find Service"
    },description: 'No Services found with serviceId you\'ve sent' })
    @ApiResponse({ status: 404, example:{
      code:"CITY_NOT_FOUND",
      message:"City not found"
    },description: 'No cities found with cityId you\'ve sent' })
    @ApiResponse({ status: 404, example:{
      code:"CITY_CONFLICT",
      message:"This city Already Registed for this Service"
    },description: 'This is city is already registerd for this service' })
    async create(
      @Body() createCityServiceVendorDto: CreateCityServiceDto,
      @GetUser() user,
    ) {
      return this.citiesService.create( createCityServiceVendorDto, user.role,user.countryId);
    }
  
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a vendor for a service in a city' })
    @ApiParam({ name: 'vendorId', description: 'Vendor ID' })
    @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
    @ApiResponse({ status: 401, description: 'Service Already registerd for this service' })
    @ApiResponse({ status: 404, example:{
      code:"CITY_SERVICE_NOT_FOUND",
      message:"Coudln't find and City Registerd for this service"
    },description: 'City Service Not found' })
    async update(
      @Param('id',ParseIntPipe) id: number,
      @Body() updateCityServiceVendorDto: UpdateCityServiceDto,
      @GetUser() user,
    ) {
      return this.citiesService.update( id,updateCityServiceVendorDto, user.role,user.countryId);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Remove a City service ' })
    @ApiParam({ name: 'Id', description: 'City Service id' })
    @ApiResponse({ status: 204, description: 'Vendor removed successfully' })
    @ApiResponse({ status: 401, description: 'Something Went wrong' })
    @ApiResponse({ status: 404, example:{
      code:"CITY_SERVICE_NOT_FOUND",
      message:"Coudln't find and City Registerd for this service"
    },description: 'City Service Not found' })
    async delete( @Param('id',ParseIntPipe) id: number, @GetUser() user) {
      return this.citiesService.delete( id, user.role,user.countryId);
    }

}
