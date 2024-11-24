import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminJwt } from './guard/jwt.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiResponse({ status: 200, description: 'User successfully authenticated.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({ type: AuthDto })
  async signin(@Body() dto: AuthDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.signin(dto, response);
  }

  @UseGuards(AdminJwt)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({ summary: 'Log out the user' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  async logout(@Res({passthrough: true}) response: Response) {
    return this.authService.logout(response);
  }
}
