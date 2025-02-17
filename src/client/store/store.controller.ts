import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { GetUser } from 'src/decorator/get-user.decorator';
import { ClientJwt } from '../guard/clientJwt.guard';

@ApiTags('Stores')
@UseGuards(ClientJwt)
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // Get all stores by type
  @Get(':section')
  @ApiOperation({ summary: 'Get all stores by section' })
  @ApiParam({
    name: 'section',
    description: 'Type of the stores (e.g., restaurant, pharmacy)',
    required: true,
    example: 'restaurant',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved stores',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Example Store' },
          imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
          bannerUrl: { type: 'string', example: 'https://example.com/banner.jpg' },
          description: { type: 'string', example: 'A great store for all your needs.' },
        },
      },
    },
  })
  async getStoresBySection(@Param('section') section: string, @GetUser() user: any) {
    const cityId = user.cityId; 
    return this.storeService.getStoresBySection(section, cityId);
  }

  // Get a single store by ID
  @Get('id/:UUID')
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the store',
    required: true,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the store',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'Example Store' },
        imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
        bannerUrl: { type: 'string', example: 'https://example.com/banner.jpg' },
        description: { type: 'string', example: 'A great store for all your needs.' },
      },
    },
  })
  async getStoreById(@Param('UUID') uuid: UUID,@GetUser() user ) {
    return this.storeService.getStoreDetailsById(uuid,user.cityId);
  }
}
