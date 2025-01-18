import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VendorJwtStrategy extends PassportStrategy(Strategy, 'vendorjwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies['vendor.authentication'];
        },
      ]),
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      igrnoreExpiration: true,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

async validate(payload: { sub: number; email: string }) : Promise<any> {
  const user = await this.prisma.vendor.findUnique({
    where: {
      id: payload.sub,
    },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  delete user.password;
  return {name: user.name,role:"VENDOR", email: user.email, id: user.id, cityId: user.cityId};
}
}
