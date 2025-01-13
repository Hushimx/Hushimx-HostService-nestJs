import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { GetUser } from 'src/auth/decorator';
import { ClientJwt } from 'src/auth/guard/clientJwt.guard';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Events')
@UseGuards(ClientJwt)
@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventService) {}

  // Get all events in the user's city
  @Get()
  @ApiOperation({ summary: 'Get events in the user’s city' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved events',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Event Title' },
          description: { type: 'string', example: 'Event description in English' },
          description_ar: { type: 'string', example: 'نبذة عن الفحالية' },
          address: { type: 'string', example: '123 Main Street' },
          locationUrl: { type: 'string', example: 'https://maps.example.com' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getEvents(
    @GetUser('cityId') cityId: number, // Extract cityId from the user
  ) {
    return this.eventService.findAll( cityId);
  }

  // Get a single event by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the event',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        title: { type: 'string', example: 'Event Title' },
        description: { type: 'string', example: 'Event description in English' },
        address: { type: 'string', example: '123 Main Street' },
        locationUrl: { type: 'string', example: 'https://maps.example.com' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getEventById(
    @Param('id') id: number,
    @GetUser('cityId') cityId: number, // Extract cityId from the user
  ) {
    return this.eventService.findOne(id,  cityId);
  }
}
