import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/products.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { GetUser } from 'src/decorator/get-user.decorator';import { AdminJwt } from 'src/admin/auth/guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { DefaultApiErrors } from '../../decorator';
import { VendorJwt } from '../vendor-auth/guard/vendorJwt.guard';

@ApiTags('Products')
@Controller('vendor/products/:storeId')
@ApiBearerAuth()
@DefaultApiErrors()
@UseGuards(VendorJwt)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Create a new product.
   * Handles file upload via `photo` field.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.create(
      storeId,
      createProductDto,
      user.id,
      user.cityId,
      file,
    );
  }

  /**
   * Fetch all products for a specific store with filtering and pagination.
   */
  @Get()
  @ApiOperation({ summary: 'Get all products for a store with filtering and pagination' })
  async findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: QueryProductDto,
    @GetUser() user: any,
  ) {
    return this.productService.findAll(storeId, query,user.id,user.cityId);
  }

  /**
   * Fetch a specific product by its ID for a store.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product for a store' })
  async findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
  ) {
    return this.productService.findOne(storeId, id,user.id, user.cityId);
  }

  /**
   * Update an existing product.
   * Handles file upload via `photo` field.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product in a store' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.update(
      storeId,
      id,
      updateProductDto,
      user.id,
      user.cityId,
      file,
    );
  }

  /**
   * Delete a specific product from a store.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product from a store' })
  async remove(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
  ) {
    return this.productService.remove(storeId, id,user.id,user.cityId);
  }
}
