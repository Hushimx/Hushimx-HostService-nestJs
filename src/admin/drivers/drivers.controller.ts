import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto, QueryDriverDto } from '../dto/driver.dto';
import { GetUser } from 'src/auth/decorator';
import { AdminJwt } from 'src/auth/guard';



@UseGuards(AdminJwt)
@Controller('admin/drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  create(
    @Body() createDriverDto: CreateDriverDto,
    @GetUser() user: any, // Get the whole user object
  ) {
    const { role, countryId } = user; // Destructure role and countryId from user
    return this.driversService.create(createDriverDto, role, countryId);
  }

  @Get()
  findAll(
    @Query() query: QueryDriverDto,
    @GetUser() user: any, // Get the whole user object
  ) {
    const { role, countryId } = user; // Destructure role and countryId from user
    return this.driversService.findAll(query, role, countryId);
  }

  @Get(':id')
  findOne(
    @Param('id',ParseIntPipe) id: number,
    @GetUser() user: any, // Get the whole user object
  ) {
    const { role, countryId } = user; // Destructure role and countryId from user
    return this.driversService.findOne(id, role, countryId);
  }

  @Patch(':id')
  update(
    @Param('id',ParseIntPipe) id: number,
    @Body() updateDriverDto: UpdateDriverDto,
    @GetUser() user: any, // Get the whole user object
  ) {
    const { role, countryId } = user; // Destructure role and countryId from user
    return this.driversService.update(id, updateDriverDto, role, countryId);
  }

  @Delete(':id')
  remove(
    @Param('id',ParseIntPipe) id: number,
    @GetUser() user: any, // Get the whole user object
  ) {
    const { role, countryId } = user; // Destructure role and countryId from user
    return this.driversService.remove(id, role, countryId);
  }
}
