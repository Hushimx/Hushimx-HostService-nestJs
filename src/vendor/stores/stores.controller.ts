import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from './dto/stores.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GetUser } from 'src/decorator/get-user.decorator';import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DefaultApiErrors } from '../../decorator';
import { Role } from '@prisma/client';
import { VendorJwt } from '../vendor-auth/guard/vendorJwt.guard';

@ApiTags('Stores')
@Controller('vendor/stores')
@ApiBearerAuth()
@DefaultApiErrors()
@UseGuards(VendorJwt)
export class StoresController {
  constructor(private readonly storeService: StoresService) {}


  /**
   * Get all stores with filtering and pagination.
   */
  @Get()
  @ApiOperation({ summary: 'Get all stores with filtering and pagination' })
  async findAll(
    @Query(new ValidationPipe({ whitelist: true, transform: true })) query: QueryStoreDto,
    @GetUser() user: any,
  ) {
    return this.storeService.findAll(query,user.id, user.cityId);
  }


  /**
   * Get a specific store by UUID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific store by UUID' })
  @ApiParam({
    name: 'uuid',
    description: 'UUID of the store',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
  ) {
    console.log(user)
    return this.storeService.findOne(id,user.id,user.cityId);
  }

  /**
   * Update a store with optional image and banner upload.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a store' })
  @ApiParam({
    name: 'uuid',
    description: 'UUID of the store',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) storeId: number,
    @Body(new ValidationPipe({ whitelist: true, transform: true })) updateStoreDto: UpdateStoreDto,
    @GetUser() user: any,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    const imageFile = files.image?.[0];
    const bannerFile = files.banner?.[0];
    return this.storeService.update(storeId, updateStoreDto, user.id,user.cityId, imageFile, bannerFile);
  }


}
