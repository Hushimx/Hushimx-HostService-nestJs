import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Store')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // Get a list of products for a specific store, with an optional filter by hotel (city)
  @Get(':storeSlug/products')
  @ApiOperation({ 
    summary: 'Get store products',
    description: 'Retrieve a list of products for a specific store. You can filter by hotel using the hotelId parameter.',
  })
  @ApiParam({
    name: 'storeSlug',
    type: String,
    description: 'The slug of the store (e.g., "example-store")',
    required: true,
  })
  @ApiQuery({
    name: 'hotelId',
    type: Number,
    description: 'The ID of the hotel to filter by city',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the products',
    schema: {
      type: 'object',
      properties: {
        storeName: { type: 'string', example: 'Example Store' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'Sample Product' },
              price: { type: 'number', example: 29.99 },
              vendor: {
                type: 'object',
                properties: {
                  id: { type: 'integer', example: 5 },
                  name: { type: 'string', example: 'Sample Vendor' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Store or hotel not found',
  })
  async getProductsByStore(
    @Param('storeSlug') storeSlug: string,
    @Query('hotelId', ParseIntPipe) hotelId?: number, // Make hotelId optional as a query parameter
  ) {
    return this.storeService.getProductsByStore(storeSlug, hotelId);
  }

  // Get a specific product from a specific store
  @Get(':storeSlug/products/:productId')
  @ApiOperation({ 
    summary: 'Get a specific product',
    description: 'Retrieve details of a specific product from a specific store.',
  })
  @ApiParam({
    name: 'storeSlug',
    type: String,
    description: 'The slug of the store',
    required: true,
  })
  @ApiParam({
    name: 'productId',
    type: Number,
    description: 'The ID of the product to retrieve',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the product',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'Sample Product' },
        price: { type: 'number', example: 29.99 },
        vendor: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 5 },
            name: { type: 'string', example: 'Sample Vendor' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getProductById(
    @Param('storeSlug') storeSlug: string,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.storeService.getProductById(storeSlug, productId);
  }
}
