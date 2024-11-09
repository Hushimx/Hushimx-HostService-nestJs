import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UUID } from 'crypto';
import { ClientLoginDto } from './dto';

@Injectable()
export class ClientService {
    constructor(
        private config: ConfigService, 
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email,
        };
        const secret = this.config.get('JWT_SECRET');
    
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '30m',
            secret: secret,
        });
    
        return {
            access_token: token,
        };
    }

    async loginWithRoomUUID(dto: ClientLoginDto): Promise<{ access_token: string }> {
        // Search for the room by UUID in the database
        const room = await this.prisma.room.findUnique({
            where: {
                uuid: dto.clientId,
            },
        });

        // Handle case where the room is not found
        if (!room) {
            throw new UnauthorizedException('Access denied: invalid or missing credentials');
        }

        // Construct payload with room info
        const payload = {
            roomId: room.id,
            roomName: room.roomNumber,   // Assuming room has a 'name' property
            hotelId: room.hotelId,
            uuid: room.uuid,
        };

        const secret = this.config.get('JWT_SECRET');

        // Generate the token with the room information in the payload
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '30m',
            secret: secret,
        });

        return {
            access_token: token,
        };
    }
}
