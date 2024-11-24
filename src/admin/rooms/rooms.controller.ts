import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { QueryRoomsDto, CreateRoomDto, EditRoomDto } from 'src/admin/dto/rooms.dto';
import { GetUser } from 'src/auth/decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminJwt } from 'src/auth/guard';

@ApiTags('Hotels/Rooms')
@Controller('rooms')
@UseGuards(AdminJwt)
@ApiBearerAuth()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get(':hotelId')
  @ApiOperation({ summary: 'Get all rooms for a specific hotel with pagination, sorting, and filtering' })
  @ApiResponse({ status: 200, description: 'Returns a list of rooms.' })
  async getRooms(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: QueryRoomsDto,
    @GetUser() user,
  ) {
    console.log(query)
    return this.roomsService.getRooms(query, user.role, user.countryId, hotelId);
  }

  @Post(':hotelId')
  @ApiOperation({ summary: 'Create a new room for a specific hotel' })
  @ApiResponse({ status: 201, description: 'Room created successfully.' })
  async createRoom(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: CreateRoomDto,
    @GetUser() user,
  ) {
    return this.roomsService.createRoom(dto, user.role, user.countryId, hotelId);
  }

  @Patch(':hotelId/:id')
  @ApiOperation({ summary: 'Edit an existing room for a specific hotel' })
  @ApiResponse({ status: 200, description: 'Room updated successfully.' })
  async editRoom(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: EditRoomDto,

    @GetUser() user,
  ) {
    return this.roomsService.editRoom(id, dto, user.role, user.countryId, hotelId);
  }

  @Delete(':hotelId/:id')
  @ApiOperation({ summary: 'Delete a room for a specific hotel' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully.' })
  async deleteRoom(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user,
  ) {
    return this.roomsService.deleteRoom(id, user.role, user.countryId, hotelId);
  }
}
