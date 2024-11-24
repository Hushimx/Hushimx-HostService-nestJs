import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signin(dto: AuthDto, response: Response): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) throw new ForbiddenException('Invalid email or password.');

    const isPasswordValid = await argon.verify(user.hash, dto.password);
    if (!isPasswordValid) throw new ForbiddenException('Invalid email or password.');

    const token = this.generateJwt(user.id, user.email, user.role);
    this.setCookie(response, token);

    return { message: 'Signin successful' };
  }

  async logout(response: Response): Promise<{ message: string }> {
    response.clearCookie('Authentication', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return { message: 'Logout successful' };
  }

  private generateJwt(userId: number, email: string,role: Role): string {
    const payload = { sub: userId, email, role };
    const secret = this.config.get<string>('JWT_SECRET');

    return this.jwt.sign(payload, {
      secret,
      expiresIn: '1h',
    });
  }

  private setCookie(response: Response, token: string): void {
    response.cookie('Authentication', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'strict',
    });
  }
}
