import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PhotoStorageService } from 'src/photo-storage/photo-storage.service';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from '../dto/stores.dto';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/auth/role-permission-service/rolesData';
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
  async create(
    createStoreDto: CreateStoreDto,
    userRole: Role,
    userCountryId?: number,
    imageFile?: Express.Multer.File,
    bannerFile?: Express.Multer.File,
  ) {
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_STORES);

    const city = await this.prisma.city.findUnique({ where: { id: createStoreDto.cityId } });
    if (!city) throw new NotFoundException('City not found.');

    this.rolePermissionService.enforceManageInCountry(userRole, Permission.CREATE_STORES, userCountryId, city.countryId);

    const imageUrl = imageFile ? await this.photoStorageService.savePhoto(imageFile, 'stores') : null;
    const bannerUrl = bannerFile ? await this.photoStorageService.savePhoto(bannerFile, 'stores') : null;
    return this.prisma.store.create({
      data: {
        name: createStoreDto.name,
        description: createStoreDto.description,
        cityId: createStoreDto.cityId,
        sectionId: 1,
        vendorId: 1,
        imageUrl,
        bannerUrl

     },
      select: this.getStoreSelect(),
    });
  }

  /**
   * Update an existing store.
   */
  async update(
    storeId: number,
    updateStoreDto: UpdateStoreDto,
    userRole: Role,
    userCountryId?: number,
    imageFile?: Express.Multer.File,
    bannerFile?: Express.Multer.File,
  ) {
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_STORES);
    
    const store = await this.getStoreWithCountry(storeId);
    this.rolePermissionService.enforceManageInCountry(userRole, Permission.EDIT_STORES, userCountryId, store.city.countryId);

    let { imageUrl, bannerUrl } = store;
    if (imageFile) {
      const newImageUrl = await this.photoStorageService.savePhoto(imageFile, 'stores');
      if (imageUrl) {
        try {
          this.photoStorageService.deletePhoto(imageUrl);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      imageUrl = newImageUrl;
    }
    if (bannerFile) {
      const newBannerUrl = await this.photoStorageService.savePhoto(bannerFile, 'stores');
      if (bannerUrl) {
        try {
          this.photoStorageService.deletePhoto(bannerUrl);
        } catch (error) {
          console.error('Error deleting old banner:', error);
        }
      }
      bannerUrl = newBannerUrl;
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        ...updateStoreDto,
        imageUrl,
        bannerUrl,
      },
      select: this.getStoreSelect(),
    });
  }

  /**
   * Delete a store and its associated images.
   */
  async remove(storeId: number, userRole: Role, userCountryId?: number) {
    const store = await this.getStoreWithCountry(storeId);

    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_STORES);
    this.rolePermissionService.enforceManageInCountry(userRole, Permission.DELETE_STORES, userCountryId, store.city.countryId);

    if (store.imageUrl) {
      try {
        this.photoStorageService.deletePhoto(store.imageUrl);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
    if (store.bannerUrl) {
      try {
        this.photoStorageService.deletePhoto(store.bannerUrl);
      } catch (error) {
        console.error('Error deleting old banner:', error);
      }
    }
    return this.prisma.store.delete({
      where: { id: storeId },
      select: { id: true, name: true },
    });
  }

  /**
   * Fetch all stores with filtering and pagination.
   */
  async findAll(query: QueryStoreDto, userRole: Role, userCountryId?: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_STORES);

    const filters = buildFilters({
      userRole,
      userCountryId,
      dto: query,
      allowedFields: ['name',"vendorId"],
    });

    if(query.sectionId) filters.sectionId = query.sectionId

    return paginateAndSort(
      this.prisma.store,
      {
        where: filters,
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
  async findOne(storeId: number, userRole: Role, userCountryId?: number) {
    const store = await this.getStoreWithCountry(storeId);

    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_STORES);
    this.rolePermissionService.enforceManageInCountry(userRole, Permission.VIEW_STORES, userCountryId, store.city.countryId);

    return store;
  }

  private async getStoreWithCountry(storeId: number) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { city: { select: { countryId: true } } },
    });
    if (!store) throw new NotFoundException('Store not found.');
    return store;
  }

  private getStoreSelect() {
    return {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      bannerUrl: true,
      city: { select: { id: true, name: true } },
      vendor: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } }
    };
  }
  async findAllSections(role: Role) {
    this.rolePermissionService.enforcePermission(role, Permission.VIEW_SECTIONS);

    return this.prisma.storeSection.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Add a new section with RBAC
   */
  async addSection(role: Role, name: string) {
    this.rolePermissionService.enforcePermission(role, Permission.MANAGE_SECTIONS);


    return this.prisma.storeSection.create({
      data: { name },
      select: { id: true, name: true },
    });
  }

  /**
   * Remove a section by ID with RBAC
   */
  async removeSection(role: Role, id: number) {
    this.rolePermissionService.enforcePermission(role, Permission.MANAGE_SECTIONS);

    const section = await this.prisma.storeSection.findUnique({
      where: { id },
    });
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found.`);
    }

    return this.prisma.storeSection.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }

}
