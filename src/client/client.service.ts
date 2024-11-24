import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UUID } from 'crypto';
import { ClientLoginDto } from './dto';
import { response, Response } from 'express';

@Injectable()
export class ClientService {
    constructor(
        private config: ConfigService, 
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}



    async loginWithRoomUUID(dto: ClientLoginDto,response: Response): Promise<{ message: string }> {
        // Search for the room by UUID in the database
        const room = await this.prisma.room.findUnique({
            where: {
                uuid: dto.clientId,
            },
            select: {
                id: true,
                hotelId: true,
                hotel: {
                  select: {
                    cityId: true,
                  },
                },
              },
        
        });

        // Handle case where the room is not found
        if (!room) {
            throw new UnauthorizedException('Access denied: invalid or missing credentials');
        }

        // Construct payload with room info
        const payload = {
            clientId : 1,
            roomId: room.id,
            cityId: room.hotel.cityId,
              };

        const secret = this.config.get('JWT_SECRET');
        // Generate the token with the room information in the payload
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '1hr',
            secret: secret,
        });
        response.cookie('Authentication', token, {
            httpOnly: true, // Prevents JavaScript from accessing the cookie
            secure: true, // Use secure cookies in production
            maxAge: 3600000, // 1 hour in milliseconds
          });
        return { message: 'Login successful' };
    }
    async logout(response: Response) {
        response.clearCookie('Authentication');
        return { message: 'Logout successful' };
      }
}
