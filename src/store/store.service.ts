import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  // Get products by store slug, optionally filtered by hotelId (city)
  async getProductsByStore(storeSlug: string, hotelId?: number) {
    // Fetch the store by slug
    const store = await this.prisma.store.findUnique({
      where: { slug: storeSlug },
      select: {
        id: true,
        name: true,
        products: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
                cityId: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with slug '${storeSlug}' not found`);
    }

    let products = store.products;

    // If hotelId is provided, filter products based on the city of the hotel
    if (hotelId) {
      // Fetch the hotel to get its cityId
      const hotel = await this.prisma.hotel.findUnique({
        where: { id: hotelId },
        select: { cityId: true },
      });

      if (!hotel) {
        throw new NotFoundException(`Hotel with ID ${hotelId} not found`);
      }

      const cityId = hotel.cityId;

      // Filter products whose vendors are in the same city
      products = products.filter(product => product.vendor.cityId === cityId);
    }

    return {
      storeName: store.name,
      products: products,
    };
  }

  // Get a specific product by store slug and product ID
  async getProductById(storeSlug: string, productId: number) {
    // Ensure the store exists
    const store = await this.prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true, name: true },
    });

    if (!store) {
      throw new NotFoundException(`Store with slug '${storeSlug}' not found`);
    }

    // Fetch the product, ensuring it belongs to the store
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        storeId: store.id,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            cityId: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${productId} not found in store '${storeSlug}'`,
      );
    }

    return product;
  }

  
}
