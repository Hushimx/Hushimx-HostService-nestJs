import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryRoomsDto, CreateRoomDto, EditRoomDto } from 'src/admin/dto/rooms.dto';
import { paginateAndSort, PaginatedResult } from 'src/utils/pagination';
import { buildSorting } from 'src/utils/sorting';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRooms(
    query: any, // Query DTO
    userRole: string,
    userCountryId?: number,
    hotelId?: number,
  ): Promise<PaginatedResult<any>> {
    if (!hotelId) {
      throw new ForbiddenException('Hotel ID must be specified.');
    }

    // Filters
    const filters: Prisma.RoomWhereInput = { hotelId };
    if (query.roomNumber) {
      filters.roomNumber = { contains: query.roomNumber, mode: 'insensitive' };
    }
    if (query.type) {
      filters.type = { contains: query.type, mode: 'insensitive' };
    }

    // Role-based restrictions
    if (userRole !== 'SUPER_ADMIN') {
      if (!userCountryId) {
        throw new ForbiddenException('Country ID is required for REGIONAL_ADMIN access.');
      }

      const hotel = await this.prisma.hotel.findUnique({
        where: { id: hotelId },
        select: { city: { select: { countryId: true } } },
      });

      if (!hotel || hotel.city.countryId !== userCountryId) {
        throw new ForbiddenException('Access denied to this hotel.');
      }
    }

    // Pagination and sorting
    return paginateAndSort(
      this.prisma.room, // Prisma model
      {
        where: filters,
        include: {
          hotel: {
            include: {
              city: {
                include: { country: true },
              },
            },
          },
        },
      },
      {
        page: parseInt(query.offset as any, 10) || 1,
        limit: parseInt(query.limit as any, 10) || 10,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
      ['roomNumber', 'type', 'createdAt'], // Allowed sort fields
    );
  }

  async createRoom(
    dto: CreateRoomDto,
    userRole: string,
    userCountryId?: number,
    hotelId?: number,
  ) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { city: { select: { countryId: true } } },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
    }

    if (userRole === 'REGIONAL_ADMIN' && hotel.city.countryId !== userCountryId) {
      throw new ForbiddenException('You can only add rooms to hotels in your assigned country.');
    }

    return this.prisma.room.create({
      data: {
        roomNumber: dto.roomNumber,
        type: dto.type,
        hotelId,
      },
      select : {
        id: true,
        roomNumber: true,
        type: true,
        hotelId: true,
      }
    });
  }

  async editRoom(
    roomId: number,
    dto: EditRoomDto,
    userRole: string,
    userCountryId?: number,
    hotelId?: number,
  ) {
    const room = await this.prisma.room.findFirst({
      where: { id: roomId, hotelId },
      include: { hotel: { include: { city: { select: { countryId: true } } } } },
    });

    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    if (userRole === 'REGIONAL_ADMIN' && room.hotel.city.countryId !== userCountryId) {
      throw new ForbiddenException('You can only edit rooms in your assigned country.');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        roomNumber: dto.roomNumber,
        type: dto.type,
      },
    });
  }

  async deleteRoom(
    roomId: number,
    userRole: string,
    userCountryId?: number,
    hotelId?: number,
  ) {
    const room = await this.prisma.room.findFirst({
      where: { id: roomId, hotelId },
      include: { hotel: { include: { city: { select: { countryId: true } } } } },
    });

    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    if (userRole === 'REGIONAL_ADMIN' && room.hotel.city.countryId !== userCountryId) {
      throw new ForbiddenException('You can only delete rooms in your assigned country.');
    }

    return this.prisma.room.delete({
      where: { id: roomId },
    });
  }
}
