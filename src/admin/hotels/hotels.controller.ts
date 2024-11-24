// src/hotels/hotels.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto, EditHotelDto, QueryHotelsDto } from '../dto/Hotels.dto';
import { GetUser } from 'src/auth/decorator';
import { ClientJwt } from 'src/auth/guard/clientJwt.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminJwt } from 'src/auth/guard';

@UseGuards(AdminJwt)
@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Retrieve a list of hotels with filtering, sorting, and pagination' })
  async getHotels(@Query() query: QueryHotelsDto) {
    return this.hotelsService.getHotels(query, "super_admin", 1);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new hotel' })
  async createHotel(@Body() dto: CreateHotelDto, @GetUser() user) {
    return this.hotelsService.createHotel(dto, "regional_admin", 1);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an existing hotel' })
  async editHotel(
    @Param('id') id: number,
    @Body() dto: EditHotelDto,
    @GetUser() user,
  ) {
    return this.hotelsService.editHotel(id, dto, "REGIONAL_ADMIN", 1);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing hotel' })
  async deleteHotel(@Param('id') id: number, @GetUser() user) {
    return this.hotelsService.deleteHotel(id, user.role, user.country);
  }

}
