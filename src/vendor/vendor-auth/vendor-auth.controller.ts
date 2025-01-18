import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { VendorAuthService } from './vendor-auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthDto } from 'src/dto/auth.dto';
import { GetUser } from 'src/decorator/get-user.decorator';
import { VendorJwt } from './guard/vendorJwt.guard';

@ApiTags('Vendor Authentication')
@Controller('vendor/auth')
export class VendorAuthController {
  constructor(private readonly vendorAuthService: VendorAuthService) {}

  @Post('signin')
  @ApiOperation({ summary: 'Sign in an existing vendor' })
  @ApiResponse({ status: 200, description: 'Vendor successfully authenticated.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async signin(@Body() dto: AuthDto, @Res({ passthrough: true }) response: Response) {
    return this.vendorAuthService.signin(dto, response);
  }

  @UseGuards(VendorJwt)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out the authenticated vendor' })
  @ApiResponse({ status: 200, description: 'Vendor successfully logged out.' })
  async logout(@Res({ passthrough: true }) response: Response) {
    return this.vendorAuthService.logout(response);
  }

  @UseGuards(VendorJwt)
  @Get('profile')
  @ApiOperation({ summary: 'Get the authenticated vendor profile' })
  @ApiResponse({ status: 200, description: 'Vendor profile fetched successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async profile(@GetUser() vendor) {
    return vendor; // Return the vendor attached by the VendorJwt guard
  }
}
