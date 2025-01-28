import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all events filtered by the user's city.
   * @param cityId City ID of the user
   */
  async findAll(cityId: number) {
    const events = await this.prisma.event.findMany({
      where: { cityId }, // Filter events by city ID
      select: {
        id: true,
        title: true,
        title_ar: true,
        description: true,
        description_ar: true,
        image: true,
        address: true,
        locationUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!events.length) {
      throw new NotFoundException('No events found for your city.');
    }

    return events;
  }

  /**
   * Get a specific event by ID and city.
   * @param id Event ID
   * @param cityId City ID of the user
   */
  async findOne(id: number, cityId: number) {
    const event = await this.prisma.event.findFirst({
      where: { id, cityId }, // Filter by event ID and city ID
      select: {
        id: true,
        title: true,
        title_ar: true,
        description: true,
        image: true,
        description_ar: true,
        address: true,
        locationUrl: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found in your city.`);
    }

    return event;
  }
}
