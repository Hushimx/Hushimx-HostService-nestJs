import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientLoginDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientJwt } from 'src/auth/guard/clientJwt.guard';
import { Request } from 'express';

@ApiTags('Client') // Grouping all Client endpoints under "Client"
@Controller('client')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post('/login')
  @ApiOperation({ summary: 'Client login using UUID' }) // Brief description of the endpoint
  @ApiResponse({
    status: 201,
    description: 'Client login successful, returns an access token',
    schema: {
      example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Room not found with the provided UUID',
  })
  async login(@Body() dto: ClientLoginDto) {
    return this.clientService.loginWithRoomUUID(dto);
  }

  @Get("/test")
  test(@Req() req: Request) {
    return req.user;
  }
}
