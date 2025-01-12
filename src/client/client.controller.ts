// client.controller.ts
import { Controller, Post, Body, Res, Get, Req, UseGuards, UnauthorizedException, Param, ValidationPipe } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientLoginDto,checkRoomAvailability } from './dto';
import { Response, Request } from 'express';
import { ClientJwt } from 'src/auth/guard/clientJwt.guard';
import { GetUser } from 'src/auth/decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiUnauthorizedResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Client Authentication') // Groups endpoints under "Client Authentication"
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}


  // New endpoint to check room availability by UUID
  @Get('room/:uuid')
  @ApiOperation({ summary: 'Check if room is available by UUID' })
  @ApiParam({ name: 'uuid', type: String, description: 'The UUID of the room to check' })
  @ApiResponse({ status: 200, description: 'Returns room availability.' })
  @ApiResponse({ status: 404, description: 'Room not found or unavailable.' })
  async checkRoomAvailability(@Param(new ValidationPipe()) DTO: checkRoomAvailability) {
    await this.clientService.checkRoomAvailability(DTO.uuid);

    return { available: true, message: 'Room is available' };
  }
  
  @Post('login')
  @ApiOperation({ summary: 'Login with Room UUID' })
  @ApiBody({ type: ClientLoginDto })
  @ApiResponse({ status: 201, description: 'Login successful.' })
  @ApiUnauthorizedResponse({ description: 'Access denied: invalid or missing credentials' })
  async loginWithRoomUUID(
    @Body() dto: ClientLoginDto,
    @Req() req: Request,
  ) {

    // Proceed with login if the user is not logged in
    const result = await this.clientService.login(dto);
    return result
  }

  @UseGuards(ClientJwt)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout the client' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  async logout(@Res() response: Response) {
    const result = await this.clientService.logout(response);
    response.json(result); // Explicitly send JSON response
  }

  @UseGuards(ClientJwt)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get client profile' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async profile(@GetUser() user) {
    return user; 
  }

}
