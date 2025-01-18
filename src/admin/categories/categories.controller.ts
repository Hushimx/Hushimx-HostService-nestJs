import { 
  Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, 
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto,UpdateCategoryDto } from 'src/admin/dto/Categories.dto';
import { Role } from '@prisma/client';
import { AdminJwt } from 'src/admin/auth/guard';
import { ApiBearerAuth, ApiDefaultResponse, ApiTags } from '@nestjs/swagger';
import { DefaultApiErrors } from '../../decorator';
import { GetUser } from 'src/decorator/get-user.decorator';


@ApiTags('Categories','Admin')
@ApiBearerAuth()
@UseGuards(AdminJwt)
@Controller('stores/:storeSlug/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @DefaultApiErrors()
  async create(
    @Param('storeSlug') storeSlug: string,
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser() user: any
  ) {
    const category = await this.categoriesService.create(storeSlug, createCategoryDto,user.role,user.countryId);
    return category;
  }

  @Get()
  @DefaultApiErrors()

  async findAll(@Param('storeSlug') storeSlug: string,@GetUser() user: any) {
    return this.categoriesService.findAll(storeSlug,user.role);
  }

  @Get(':id')
  @DefaultApiErrors()

  async findOne(@Param('storeSlug') storeSlug: string, @Param('id',ParseIntPipe) id: number,@GetUser() user: any) {
    const category = await this.categoriesService.findOne(storeSlug,id,user.role);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  @Patch(':id')
  @DefaultApiErrors()

  async update(
    @Param('storeSlug') storeSlug: string,
    @Param('id',ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: any
  ) {
    const category = await this.categoriesService.update(storeSlug, id, updateCategoryDto,user.role);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  @Delete(':id')
  @DefaultApiErrors()

  async remove(@Param('storeSlug') storeSlug: string, @Param('id',ParseIntPipe) id: number,@GetUser() user: any) {
    const category = await this.categoriesService.remove(storeSlug, id,user.role);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
