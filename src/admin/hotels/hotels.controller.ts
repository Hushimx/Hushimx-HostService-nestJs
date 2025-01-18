import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto, EditHotelDto, QueryHotelsDto } from '../dto/Hotels.dto';
import { GetUser } from 'src/decorator/get-user.decorator';import { AdminJwt } from 'src/admin/auth/guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Hotels')
@Controller('admin/hotels')
@UseGuards(AdminJwt)
@ApiBearerAuth()
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve a list of hotels with filtering, sorting, and pagination' })
  async getHotels(@Query(new ValidationPipe({ transform: true, whitelist: true })) query: QueryHotelsDto, @GetUser() user) {
    return this.hotelsService.getHotels(query, user.role, user.countryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve details of a specific hotel' })
  async getHotel(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.hotelsService.getHotel(id, user.role, user.countryId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new hotel' })
  async createHotel(@Body() dto: CreateHotelDto, @GetUser() user) {
    return this.hotelsService.createHotel(dto, user.role, user.countryId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an existing hotel' })
  async editHotel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditHotelDto,
    @GetUser() user,
  ) {
    return this.hotelsService.editHotel(id, dto, user.role, user.countryId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing hotel' })
  async deleteHotel(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.hotelsService.deleteHotel(id, user.role, user.countryId);
  }
}
