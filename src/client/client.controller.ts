// client.controller.ts
import { Controller, Post, Body, Res, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientLoginDto } from './dto';
import { Response, Request } from 'express';
import { ClientJwt } from 'src/auth/guard/clientJwt.guard';
import { GetUser } from 'src/auth/decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Client Authentication') // Groups endpoints under "Client Authentication"
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @UseGuards(ClientJwt)
  @ApiBearerAuth() // Indicates that the endpoint requires authentication
  @Get('/test')
  @ApiOperation({ summary: 'Test authentication' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  test(@Req() req: Request, @GetUser() user) {
    // Select specific properties from req to avoid circular references
    return user;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with Room UUID' })
  @ApiBody({ type: ClientLoginDto })
  @ApiResponse({ status: 201, description: 'Login successful.' })
  @ApiUnauthorizedResponse({ description: 'Access denied: invalid or missing credentials' })
  async loginWithRoomUUID(
    @Body() dto: ClientLoginDto,
    @Res() response: Response,
    @Req() req: Request,
  ) {
    // Check if the Authentication cookie already exists
    if (req.cookies['Authentication']) {
      throw new UnauthorizedException('You are already logged in.');
    }

    // Proceed with login if the user is not logged in
    const result = await this.clientService.loginWithRoomUUID(dto, response);
    response.json(result);
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
}
