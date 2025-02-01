import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PhotoStorageService } from 'src/photo-storage/photo-storage.service';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from '../dto/stores.dto';
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

    const image = imageFile ? await this.photoStorageService.savePhoto(imageFile, 'stores') : null;
    const banner = bannerFile ? await this.photoStorageService.savePhoto(bannerFile, 'stores') : null;
    return this.prisma.store.create({
      data: {
        name: createStoreDto.name,
        address: createStoreDto.address,
        locationUrl: createStoreDto.locationUrl,
        description: createStoreDto.description,
        cityId: createStoreDto.cityId,
        sectionId: createStoreDto.sectionId,
        vendorId: createStoreDto.vendorId,
        image,
        banner

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
      where: { id: storeId },
      data: {
        ...updateStoreDto,
        image,
        banner,
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
    
    const deleteStore = await this.prisma.store.delete({
      where: { id: storeId },
      select: { id: true, name: true },
    });
    if (store.image) {
      try {
        this.photoStorageService.deletePhoto(store.image);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
    if (store.banner) {
      try {
        this.photoStorageService.deletePhoto(store.banner);
      } catch (error) {
        console.error('Error deleting old banner:', error);
      }
    }
    return deleteStore;
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
      address:true,
      locationUrl:true,
      description: true,
      image: true,
      banner: true,
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
        name_ar: true,
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
      data: { name, name_ar: name,slug: name.toLowerCase().replace(' ', '-') },
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
