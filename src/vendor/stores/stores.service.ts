import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PhotoStorageService } from 'src/photo-storage/photo-storage.service';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from './dto/stores.dto';
import { RolePermissionService } from 'src/admin/auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/admin/auth/role-permission-service/rolesData';
import { paginateAndSort } from 'src/utils/pagination';
import { buildFilters } from 'src/utils/filters';

@Injectable()
export class StoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly photoStorageService: PhotoStorageService,
  ) {}

  /**
   * Create a new store with optional image and banner uploads.
   */

  /**
   * Update an existing store.
   */
  async update(
    storeId: number,
    updateStoreDto: UpdateStoreDto,
    vendorId: number,
    cityid: number,
    imageFile?: Express.Multer.File,
    bannerFile?: Express.Multer.File,
  ) {
    console.log(updateStoreDto)
    const store = await this.getStore(storeId,vendorId,cityid);

    let { image, banner } = store;
    if (imageFile) {
      const newimage = await this.photoStorageService.savePhoto(imageFile, 'stores');
      if (image) {
        try {
          this.photoStorageService.deletePhoto(image);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      image = newimage;
    }
    if (bannerFile) {
      const newbanner = await this.photoStorageService.savePhoto(bannerFile, 'stores');
      if (banner) {
        try {
          this.photoStorageService.deletePhoto(banner);
        } catch (error) {
          console.error('Error deleting old banner:', error);
        }
      }
      banner = newbanner;
    }

    return this.prisma.store.update({
      where: { id: storeId,vendorId:vendorId },
      data: {
        ...updateStoreDto,
        image,
        banner,
      },
      select: this.getStoreSelect(),
    });
  }


  /**
   * Fetch all stores with filtering and pagination.
   */
  async findAll(query: QueryStoreDto,vendorId: number, cityId: number) {
    const filters: {name?: any, cityId: number,vendorId: number} = {cityId:cityId,vendorId:vendorId};

    if(query.name) filters.name = { contains: query.name, mode: 'insensitive' };
   


    return paginateAndSort(
      this.prisma.store,
      {
        where: {...filters,vendorId:vendorId,cityId:cityId},
        select: this.getStoreSelect(),
      },
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortField: query.sortField || 'name',
        sortOrder: query.sortOrder || 'asc',
      },
      ['name', 'createdAt', 'city.name'],
    );
  }

  /**
   * Fetch a specific store by UUID.
   */
  async findOne(storeId: number,vendorId: number, cityid: number) {
    console.log(storeId,vendorId,cityid)
    const store = await this.getStore(storeId,vendorId,cityid);
    
    return store;
  }

  private async getStore(storeId: number,vendorId: number,cityid: number) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId, cityId: cityid,vendorId:vendorId },
    });
    if (!store) throw new NotFoundException({code: "STORE_NOT_FOUND", message: "Store not found"});
    return store;
  }

  private getStoreSelect() {
    return {
      id: true,
      name: true,
      description: true,
      image: true,
      banner: true,
      vendor: { select: { id: true, name: true } },
      section: { select: {  name: true } }
    };
  }




}
