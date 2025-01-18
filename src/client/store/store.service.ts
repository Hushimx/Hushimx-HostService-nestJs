import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService,private readonly config: ConfigService) {}

   async getStoresBySection(type: string, userCityId: number) {
    const stores = await this.prisma.store.findMany({
      where: { cityId: userCityId },
    });
    return stores;
  }

  
    async getStoreDetailsById(storeUUID: string, userCityId: number) {
      const store = await this.prisma.store.findUnique({
        where: { uuid: storeUUID,cityId:userCityId },
        select: {
          id:true,
          name: true,
          image: true, // Assuming `imageUrl` is a column in the `store` table
          banner:true,
          description: true, // Assuming `description` is a column in the `store` table
          cityId: true, // Fetch the cityId to validate
        },
      });
  
      // Step 2: Handle case where the store is not found
      if (!store) {
        throw new NotFoundException(`Store with UUID '${storeUUID}' not found.`);
      }
  
      // Step 3: Check if the store's city matches the user's city
      if (store.cityId !== userCityId) {
        throw new ForbiddenException('You are not allowed to access this store.');
      }
  
      // Step 4: Fetch the products related to the store
      const products = await this.prisma.product.findMany({
        where: { storeId: store.id }, // Assuming products are linked by store UUID
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
  
      // Step 5: Return the store details along with the products
      return {
        storeName: store.name,
        image:  store.image,
        banner: store.banner,
        description: store.description,
        products: products,
      };
    }
  
  // Get a specific product by store slug and product ID
  async getProductById(storeSlug: string, productId: number) {
    // Ensure the store exists
    const store = await this.prisma.store.findUnique({
      where: { uuid: storeSlug, },
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
      select: {
        id:true,
        name: true,
        // vendor: {
        //   select: {
        //     id: true,
        //     name: true,
        //     cityId: true,
        //   },
        // },
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
