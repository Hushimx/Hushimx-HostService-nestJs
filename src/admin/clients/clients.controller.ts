import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, ValidationPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { GetUser } from 'src/auth/decorator';
import { CreateClientDto, UpdateClientDto, QueryClientDto } from './dto/clients.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AdminJwt } from 'src/auth/guard';

@UseGuards(AdminJwt)
@Controller('admin/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  create(@Body() createClientDto: CreateClientDto, @GetUser() user) {
    return this.clientsService.create(createClientDto, user.role, user.countryId);
  }

  @ApiOperation({ 
    summary: 'Retrieve a paginated, filterable list of clients.',
    description: `By default, users only see clients in their assigned country. 
                  However, if the user queries for clients and 
                  they have the required permissions, 
                  they will see clients from the specified country. Otherwise, 
                  they remain restricted to their assigned country.`
  })
  @Get()
  findAll(@GetUser() user, @Query(new ValidationPipe({ transform: true, whitelist: true, })) findDto: QueryClientDto) {
    return this.clientsService.findAll(user.role, user.countryId, findDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve details of a specific client' })
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.clientsService.findOne(id, user.role, user.countryId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing client' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClientDto: UpdateClientDto, @GetUser() user) {
    return this.clientsService.update(id, updateClientDto, user.role, user.countryId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing client' })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.clientsService.remove(id, user.role, user.countryId);
  }
}