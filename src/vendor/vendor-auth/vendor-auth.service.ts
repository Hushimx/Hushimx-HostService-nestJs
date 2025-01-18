import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { Role } from '@prisma/client';
import { AuthDto } from 'src/dto/auth.dto';

@Injectable()
export class VendorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signin(dto: AuthDto, response: Response): Promise<{ token: string }> {
    const user = await this.prisma.vendor.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) throw new UnauthorizedException('Invalid email or password.');

    const isPasswordValid = await argon.verify(user.password, dto.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password.');

    const token = this.generateJwt(user.id, user.email, "VENDOR");
    this.setCookie(response, token);

    return { token: token };
  }

  async logout(response: Response): Promise<{ message: string }> {
    response.clearCookie('vendor.authentication', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
    });

    return { message: 'Logout successful' };
  }

  private generateJwt(userId: number, email: string,role): string {
    const payload = { sub: userId, email, role };
    const secret = this.config.get<string>('JWT_SECRET');

    return this.jwt.sign(payload, {
      secret,
      expiresIn: '23h',
    });
  }

  private setCookie(response: Response, token: string): void {
    response.cookie('vendor.authentication', token, {
      httpOnly: true,
      secure: true,
      maxAge: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
    // maxAge: 3600000000,
      sameSite: 'strict',
    });
  }

}
