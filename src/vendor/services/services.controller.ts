import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ValidationPipe, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import {  CreateCityServiceDto } from './dto/create-city.dto';
import {  UpdateCityServiceDto } from './dto/update-city.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/decorator/get-user.decorator';import { QueryCityServiceDto } from './dto/query-city.dto';
import { DefaultApiErrors } from 'src/decorator';
import { VendorJwt } from '../vendor-auth/guard/vendorJwt.guard';


@DefaultApiErrors()
@UseGuards(VendorJwt)
@Controller('vendor/services')
export class CitiesController {
  constructor(private readonly servicesService: ServicesService) {}
  
    @Get()
    @ApiOperation({ summary: 'Get all services registed for a vendor' })
    @ApiResponse({ status: 200, description: 'List of City Services' })
    async findAll(@Query(new ValidationPipe({ transform: true, whitelist: true, })) query :  QueryCityServiceDto,@GetUser() user) {
      return this.servicesService.findAll(query, user);
    }


    @Get(":id")
    
    @ApiOperation({ summary: 'Get  Service With the ID you\'ve sent' })
    @ApiResponse({ status: 200, description: 'Get one  service' })
    @ApiResponse({ status: 404, example:{
      code:"CITY_NOT_FOUND",
      message:"City not found"
    },description: 'No cities found with cityId you\'ve sent' })

    async findOne(@Param("id",ParseIntPipe) id : number , @GetUser() user) {
      return this.servicesService.findOne(id,user)
    }


  
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update service' })
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
      return this.servicesService.update( id,updateCityServiceVendorDto, user);
    }
  
  }