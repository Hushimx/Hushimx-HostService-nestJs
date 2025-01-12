import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { Admin } from 'types/admin';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'adminjwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.Authentication;
        },
      ]),
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      igrnoreExpiration: true,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

async validate(payload: { sub: number; email: string }) : Promise<any> {
  console.log(payload)
  const user = await this.prisma.admin.findUnique({
    where: {
      id: payload.sub,
    },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  delete user.password;
  return {name: user.name, email: user.email, id: user.id, role: user.role, countryId: user.countryId};
}
}
