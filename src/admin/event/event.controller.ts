import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UseGuards, ParseIntPipe } from '@nestjs/common';
import { Admin } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwt } from 'src/auth/guard';
import { QueryEventDto } from './dto/query-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './event.service';




@ApiTags('Events')
@Controller('admin/events')
@UseGuards(AdminJwt)
@ApiBearerAuth()
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve a list of events with filtering, sorting, and pagination' })
  async getEvents(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: QueryEventDto,
    @GetUser() user,
  ) {
    return this.eventService.getEvents(query, user.role, user.countryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve details of a specific event' })
  async getEvent(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.eventService.getEvent(id, user.role, user.countryId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  async createEvent(@Body() dto: CreateEventDto, @GetUser() user) {
    return this.eventService.createEvent(dto, user.role, user.countryId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an existing event' })
  async editEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
    @GetUser() user,
  ) {
    return this.eventService.editEvent(id, dto, user.role, user.countryId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing event' })
  async deleteEvent(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.eventService.deleteEvent(id, user.role, user.countryId);
  }
}
