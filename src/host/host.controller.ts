import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { HostService } from './host.service';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { AdminJwt} from '../auth/guard'; // Use the appropriate guard for your setup
import { UUID } from 'crypto';

@Controller('host')
@UseGuards(AdminJwt) // Ensure user is authenticated
export class HostController {
  constructor(private readonly HostService: HostService) {}

  // Endpoint to get rooms for a user's hotels
  @Get('/rooms')
  async getRooms(@GetUser('id') userId: number) {
    return this.HostService.getRoomsByUser(userId);
  }

  // Endpoint to add a room
  @Post('/rooms')
  async addRoom(
    @GetUser('id') userId: number,
    @Body()
    createRoomDto: {
      hotelId: number;
      roomNumber: string;
    },
  ) {
    return this.HostService.addRoom(userId, createRoomDto.hotelId, {
      roomNumber: createRoomDto.roomNumber,
    });
  }

  // Endpoint to delete a room by its ID
  @Delete('/rooms/:roomId')
  async deleteRoom(
    @GetUser('id') userId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.HostService.deleteRoom(userId, roomId);
  }
}
