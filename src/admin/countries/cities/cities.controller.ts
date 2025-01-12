// cities.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { GetUser } from 'src/auth/decorator';
import { CreateCityDto, UpdateCityDto,  QueryCityDto } from 'src/admin/dto/cities.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AdminJwt } from 'src/auth/guard';

@UseGuards(AdminJwt)
@Controller('admin/countries/:countryId/cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new city' })
  create(@Param('countryId', ParseIntPipe) countryId: number, @Body() createCityDto: CreateCityDto, @GetUser() user) {
    return this.citiesService.create(countryId, createCityDto, user.role, user.countryId);
  }

  @ApiOperation({ 
    summary: 'Retrieve a paginated, filterable list of cities.',
    description: `By default, users only see cities in their assigned country. 
                  However, if the user queries for a certain country's cities and 
                  they have the required permissions (e.g., ACCESS_ALL_HOTELS), 
                  they will see cities from that specified country. Otherwise, 
                  they remain restricted to their assigned country.`
  })
  @Get()
  findAll(@Param('countryId', ParseIntPipe) countryId: number, @GetUser() user, @Body() findDto: QueryCityDto) {
    return this.citiesService.findAll(countryId, user.role, user.countryId, findDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve details of a specific city' })
  findOne(@Param('countryId', ParseIntPipe) countryId: number, @Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.citiesService.findOne(countryId, id, user.role, user.countryId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing city' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCityDto: UpdateCityDto, @GetUser() user) {
    return this.citiesService.update(id, updateCityDto, user.role, user.countryId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing city' })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.citiesService.remove(id, user.role, user.countryId);
  }
}