import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from '../dto/products.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('store/:storeSlug/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(
    @Param('storeSlug') storeSlug: string,
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
  ) {
    return this.productService.create(storeSlug, createProductDto, req.user.role, req.user.countryId);
  }

  @Get()
  async findAll(
    @Param('storeSlug') storeSlug: string,
    @Query() query: QueryProductDto,
    @Req() req: any,
  ) {
    return this.productService.findAll(storeSlug, query, req.user.role, req.user.countryId);
  }

  @Patch(':id')
  async update(
    @Param('storeSlug') storeSlug: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productService.update(storeSlug, parseInt(id, 10), updateProductDto, req.user.role, req.user.countryId);
  }

  @Delete(':id')
  async remove(@Param('storeSlug') storeSlug: string, @Param('id') id: string, @Req() req: any) {
    return this.productService.remove(storeSlug, parseInt(id, 10), req.user.role, req.user.countryId);
  }
}
