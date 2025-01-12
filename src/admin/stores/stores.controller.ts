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
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from '../dto/stores.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator';
import { AdminJwt } from 'src/auth/guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DefaultApiErrors } from '../decorator';
import { Role } from '@prisma/client';

@ApiTags('Stores')
@Controller('admin/stores')
@ApiBearerAuth()
@DefaultApiErrors()
@UseGuards(AdminJwt)
export class StoresController {
  constructor(private readonly storeService: StoresService) {}

  /**
   * Create a new store with image and banner upload.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new store' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  async create(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) createStoreDto: CreateStoreDto,
    @GetUser() user: any,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    const imageFile = files.image?.[0];
    const bannerFile = files.banner?.[0];
    return this.storeService.create(createStoreDto, user.role, user.countryId, imageFile, bannerFile);
  }

  /**
   * Get all stores with filtering and pagination.
   */
  @Get()
  @ApiOperation({ summary: 'Get all stores with filtering and pagination' })
  async findAll(
    @Query(new ValidationPipe({ whitelist: true, transform: true })) query: QueryStoreDto,
    @GetUser() user: any,
  ) {
    return this.storeService.findAll(query, user.role, user.countryId);
  }
  @Get("sections")
  @ApiOperation({ summary: "Get all sections", description: "Fetches all store sections." })
  @ApiResponse({
    status: 200,
    description: "List of all sections.",
    schema: {
      example: [
        {
          id: 1,
          name: "Electronics",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          name: "Groceries",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ],
    },
  })
  async findAllSections(@GetUser("role") role: any) {
    return this.storeService.findAllSections(role);
  }

  /**
   * Add a new section
   */
  @Post("sections")
  @ApiOperation({
    summary: "Add a new section",
    description: "Adds a new store section. The section name must be unique.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Groceries" },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Section created successfully.",
    schema: {
      example: {
        id: 3,
        name: "Groceries",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Section with this name already exists.",
  })
  async addSection(@Body("name") name: string, @GetUser("role") role: any) {
    return this.storeService.addSection(role, name);
  }

  /**
   * Remove a section by ID
   */
  @Delete("sections/:id")
  @ApiOperation({
    summary: "Remove a section by ID",
    description: "Removes a store section by its ID.",
  })
  @ApiParam({
    name: "id",
    description: "ID of the section to be removed.",
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Section removed successfully.",
    schema: {
      example: {
        id: 1,
        name: "Resturants",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Section not found.",
  })
  async removeSection(
    @Param("id", ParseIntPipe) id: number,
    @GetUser("role") role: any
  ) {
    return this.storeService.removeSection(role, id);
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
    return this.storeService.findOne(id, user.role, user.countryId);
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
    return this.storeService.update(storeId, updateStoreDto, user.role, user.countryId, imageFile, bannerFile);
  }

  /**
   * Delete a store by UUID.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a store by UUID' })
  @ApiParam({
    name: 'uuid',
    description: 'UUID of the store',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async remove(@Param('id', ParseIntPipe) storeId: number, @GetUser() user: any) {
    return this.storeService.remove(storeId, user.role, user.countryId);
  }
}
