import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminJwt } from './guard/jwt.guard';
import { NoAuthGuard } from './guard/noAuth.guard';
import { GetUser } from './decorator';
import { Admin } from 'types/admin';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(NoAuthGuard) // Use the NoAuthGuard to ensure user is not logged in
  @Post('signin')
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiResponse({ status: 200, description: 'User successfully authenticated.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({ type: AuthDto })
  async signin(@Body() dto: AuthDto, @Res({ passthrough: true }) response: Response) {
    console.log(dto)
    return this.authService.signin(dto, response);
  }

  @UseGuards(AdminJwt)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out the authenticated user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out.' })
  async logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  @UseGuards(AdminJwt) // Protect this route with AdminJwt guard
  @Get('profile')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile fetched successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async profile(@GetUser() admin : Admin) {
    return admin; // Return the user attached by the AdminJwt guard
  }
}
