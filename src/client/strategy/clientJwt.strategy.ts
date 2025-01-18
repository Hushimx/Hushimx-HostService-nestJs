import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UUID } from 'crypto';
import { Request } from 'express';

@Injectable()
export class ClientJwtStrategy extends PassportStrategy(Strategy, 'clientJwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (req: Request) => {
      //     return req?.cookies?.Authentication;
      //   },
      // ]),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload) {

    const room = await this.prisma.room.findUnique({
      where: {
        id: payload.roomId,
      },
      select: {
        id: true,
        roomNumber: true,
        hotelId: true,
        hotel: {
          select: {
            cityId: true,
            name: true
          },
        },
      },
    });

    if (!room || !room.hotel) {
      // Handle the case where the room or hotel is not found
      return null;
    }
    const City = await this.prisma.city.findUnique({
      where: {
        id: room.hotel.cityId,
      },
      include : {
        country: true,
      }
    })
    return {
      roomId: room.id,
      roomNumber: payload.roomNumber,
      hotelId: room.hotelId,
      hotelName: room.hotel.name,
      clientId: payload.clientId,
      cityId: room.hotel.cityId,
      countryCode: City.country.code, // Note the optional chaining operator (?.)
      currencySign: City.country.currency,
    };
  }
}
