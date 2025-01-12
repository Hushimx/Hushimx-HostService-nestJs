import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { AdminJwt } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultApiErrors } from 'src/admin/decorator/swagger-common-responses';

@ApiTags('countries')
@UseGuards(AdminJwt)
@Controller('admin/countries')
@ApiBearerAuth()
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  // @Post()
  // create(@Body() createCountryDto: CreateCountryDto) {
  //   return this.countriesService.create(createCountryDto);
  // }


  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({
    status: 200,
    description: 'List of countries',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          code: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @DefaultApiErrors()
  // @ApiResponse({
  //   status: 401,
  //   description: 'Unauthorized: Invalid or missing authentication token',
  // })
  // @ApiResponse({
  //   status: 403,
  //   description: 'Forbidden: User does not have permission to access this resource',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Internal Server Error: An unexpected error occurred',
  // })
  
  @Get()
  
  findAll(@GetUser() user) {
    return this.countriesService.findAll(user.role);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.countriesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
  //   return this.countriesService.update(+id, updateCountryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.countriesService.remove(+id);
  // }
}
