import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { GetUser } from 'src/auth/decorator';
import { FindAllCitiesDto } from 'src/admin/dto/cities.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AdminJwt } from 'src/auth/guard';


@UseGuards(AdminJwt)
@Controller('admin/countries/:countryId/cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  // @Post()
  // create(@Body() createCityDto: CreateCityDto, @GetUser() user) {
  //   return this.citiesService.create(createCityDto);
  // }
  @ApiOperation({ 
    summary: 'Retrieve a paginated, filterable list of cities.',
    description: `By default, users only see cities in their assigned country. 
                  However, if the user queries for a certain country's cities and 
                  they have the required permissions (e.g., ACCESS_ALL_HOTELS), 
                  they will see cities from that specified country. Otherwise, 
                  they remain restricted to their assigned country.`
  })
  @Get()
  findAll(@Param("countryId",ParseIntPipe) countryId,@GetUser() user,@Body() findDto: FindAllCitiesDto) {
    return this.citiesService.findAll(countryId,user.role,user.countryId,findDto);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.citiesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
  //   return this.citiesService.update(+id, updateCityDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.citiesService.remove(+id);
  // }
}
