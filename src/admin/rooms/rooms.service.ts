import { Injectable, ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryRoomsDto, CreateRoomDto, EditRoomDto } from 'src/admin/dto/rooms.dto';
import { paginateAndSort, PaginatedResult } from 'src/utils/pagination';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/auth/role-permission-service/rolesData';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async getRooms(
    hotelId: number,
    query: QueryRoomsDto,
    userRole: Role,
    userCountryId: number,
  ): Promise<PaginatedResult<any>> {
    if (!hotelId) {
      throw new ForbiddenException('Hotel ID must be specified.');
    }

    // Enforce view permission
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_HOTELS);

    // Filters
    const filters = { hotelId } as any;
    if (query.roomNumber) {
      filters.roomNumber = { contains: query.roomNumber, mode: 'insensitive' };
    }
    if (query.type) {
      filters.type = { contains: query.type, mode: 'insensitive' };
    }

    // Enforce access to hotel by country
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { city: { select: { countryId: true } } },
    });
    console.log(hotel,"hotelll",hotelId)
    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.VIEW_HOTELS,
      userCountryId,
      hotel.city.countryId,
    );

    // Pagination and sorting
    return paginateAndSort(
      this.prisma.room,
      {
        where: filters,

      },
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
      ['roomNumber', 'type', 'createdAt'],
    );
  }
  async getRoom(hotelId: number,RoomsId: number, userRole: Role, userCountryId: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_HOTELS);
    console.log(hotelId,RoomsId,userRole,userCountryId)
    const room = await this.prisma.room.findFirst({
      where: {
        id: RoomsId,
        hotelId: hotelId,
      },
      include: {
        hotel: {
          include: {
            city: {
              include: {
                country: true,
              },
            },
          },
        },
      },
    });
  
    if (!room) {
      throw new NotFoundException('Room not found.');
    }
  
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.VIEW_HOTELS,
      userCountryId,
      room.hotel.city.countryId,
    );
  
    return room;
  }
  async createRoom(dto: CreateRoomDto, userRole: Role, userCountryId?: number, hotelId?: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_HOTELS);
  
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { city: { select: { countryId: true } } },
    });
  
    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
    }
  
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.CREATE_HOTELS,
      userCountryId,
      hotel.city.countryId,
    );
  
    try {
      const room = await this.prisma.room.create({
        data: { roomNumber: dto.roomNumber, type: dto.type, hotelId },
      });
      return room
    } catch (error) {
      if (error.code === 'P2002') { // Prisma's unique constraint error code
        throw new ConflictException(
         {
            code: 'ROOM_ALREADY_EXISTS',
            message: 'A room with this number already exists in this hotel.',
          }
        );
      }
      throw error; // Rethrow other unexpected errors
    }
  }
  

  async editRoom(
    roomId: number,
    dto: EditRoomDto,
    userRole: Role,
    userCountryId?: number,
    hotelId?: number,
  ) {
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_HOTELS);

    const room = await this.prisma.room.findFirst({
      where: { id: roomId, hotelId },
      include: { hotel: { include: { city: { select: { countryId: true } } } } },
    });

    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.EDIT_HOTELS,
      userCountryId,
      room.hotel.city.countryId,
    );
    try{
      const room = await this.prisma.room.update({
        where: { id: roomId },
        data: { roomNumber: dto.roomNumber, type: dto.type },
      });
      return room
    } catch (error) {
      if (error.code === 'P2002') { // Prisma's unique constraint error code
        throw new ConflictException(
         {
            code: 'ROOM_ALREADY_EXISTS',
            message: 'A room with this number already exists in this hotel.',
          }
        );
      }
      throw error; // Rethrow other unexpected errors
    }

  }

  async deleteRoom(
    roomId: number,
    userRole: Role,
    userCountryId?: number,
    hotelId?: number,
  ) {
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_HOTELS);

    const room = await this.prisma.room.findFirst({
      where: { id: roomId, hotelId },
      include: { hotel: { include: { city: { select: { countryId: true } } } } },
    });

    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.DELETE_HOTELS,
      userCountryId,
      room.hotel.city.countryId,
    );

    return this.prisma.room.delete({
      where: { id: roomId },
    });
  }
}
