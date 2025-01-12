import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UUID } from 'crypto';
import { ClientLoginDto } from './dto';
import { response, Response } from 'express';
import { GetUser } from 'src/auth/decorator';

@Injectable()
export class ClientService {
    constructor(
        private config: ConfigService, 
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}


    async checkRoomAvailability(uuid: UUID): Promise<boolean> {
      const room = await this.prisma.room.findUnique({
        where: {
          uuid: uuid,
        },
      })
  
      if (!room) {
        throw new NotFoundException('Room not found');
      }
  
      return true;
    }
  
    async login(dto: ClientLoginDto): Promise<{ message: string; token: string }> {
      // Step 1: Validate Room by UUID
      const room = await this.prisma.room.findUnique({
        where: {
          uuid: dto.uuid,
        },
        select: {
          id: true,
          hotelId: true,
          roomNumber: true,
          hotel: {
            select: {
              name: true,
              cityId: true
            },
          },
        },
      });
    
      if (!room) {
        throw new UnauthorizedException({
          code: 'INVALID_ROOM_UUID',
          message: 'INVALID Room Code',
        });
      }
      // Step 2: Find or Create Client by Phone Number
      let client = await this.prisma.client.findFirst({
        where: {
          phoneNo: dto.phoneNumber,
        },
      });
    
      if (!client) {
        // Create new client if not found
        client = await this.prisma.client.create({
          data: {
            phoneNo: dto.phoneNumber,
            countryCode:"SA"
          },
        });
      }
    
      // Step 3: Construct JWT Payload
      const payload = {
        clientId: client.id,
        roomId: room.id,
        // roomNumber: room.roomNumber,
        // HotelId: room.hotelId,
        // cityId: room.hotel.cityId,
      };
    
      // Step 4: Generate JWT Token
      const secret = this.config.get('JWT_SECRET');
      const token = await this.jwt.signAsync(payload, {
        expiresIn: '6h',
        secret: secret,
      });
    
    
      // Return Success Response
      return {
        message: 'Login successful',
        token: token,

      };
    }
    
    async logout(response: Response) {
        response.clearCookie('Authentication');
        return { message: 'Logout successful' };
    }

}
