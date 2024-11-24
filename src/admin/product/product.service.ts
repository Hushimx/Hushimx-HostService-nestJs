import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from '../dto/products.dto';
import { paginateAndSort, PaginatedResult } from 'src/utils/pagination';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    storeSlug: string,
    createProductDto: CreateProductDto,
    userRole: string,
    userCountryId?: number,
  ) {
    const store = await this.prisma.store.findUnique({
      where: { slug: storeSlug },
    });

    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    // Regional Admin: Ensure the product's city is within their assigned region
    if (userRole === 'REGIONAL_ADMIN') {
      const city = await this.prisma.city.findUnique({
        where: { id: createProductDto.cityId },
        select: { countryId: true },
      });

      if (!city || city.countryId !== userCountryId) {
        throw new ForbiddenException('You can only add products in your assigned region.');
      }
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        storeId: store.id,
      },
    });
  }

  async findAll(
    storeSlug: string,
    query: QueryProductDto,
    userRole: string,
    userCountryId?: number,
  ): Promise<PaginatedResult<any>> {
    const store = await this.prisma.store.findUnique({
      where: { slug: storeSlug },
    });

    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const filters: any = { storeId: store.id };

    // Regional Admin: Restrict to their assigned region
    if (userRole === 'REGIONAL_ADMIN') {
      filters.city = {
        countryId: userCountryId,
      };
    }

    return paginateAndSort(
      this.prisma.product,
      {
        where: filters,
        include: { city: true, vendor: true },
      },
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
      },
      ['name', 'price', 'createdAt'],
    );
  }

  async update(
    storeSlug: string,
    productId: number,
    updateProductDto: UpdateProductDto,
    userRole: string,
    userCountryId?: number,
  ) {
    const product = await this.findOne(storeSlug, productId, userRole, userCountryId);

    return this.prisma.product.update({
      where: { id: product.id },
      data: updateProductDto,
    });
  }

  async findOne(
    storeSlug: string,
    productId: number,
    userRole: string,
    userCountryId?: number,
  ) {
    const store = await this.prisma.store.findUnique({
      where: { slug: storeSlug },
    });

    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, storeId: store.id },
      include: { city: true, vendor: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    // Regional Admin: Restrict access to products in their assigned region
    if (userRole === 'REGIONAL_ADMIN' && product.city.countryId !== userCountryId) {
      throw new ForbiddenException('Access denied to this product.');
    }

    return product;
  }

  async remove(storeSlug: string, productId: number, userRole: string, userCountryId?: number) {
    const product = await this.findOne(storeSlug, productId, userRole, userCountryId);

    return this.prisma.product.delete({
      where: { id: product.id },
    });
  }
}
