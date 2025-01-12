import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PhotoStorageService } from 'src/photo-storage/photo-storage.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from '../dto/products.dto';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/auth/role-permission-service/rolesData';
import { paginateAndSort } from 'src/utils/pagination';
import { buildFilters } from 'src/utils/filters';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly photoStorageService: PhotoStorageService,
  ) {}

  /**
   * Create a new product with optional photo upload.
   */
  async create(
    storeId: number,
    createProductDto: CreateProductDto,
    userRole: Role,
    userCountryId?: number,
    file?: Express.Multer.File,
  ) {
    // Fetch store once and include countryId for validation
    const store = await this.getStoreWithCountry(storeId);

    // Enforce permissions
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_PRODUCTS);
    this.rolePermissionService.enforceManageInCountry(userRole, Permission.CREATE_PRODUCTS, userCountryId, store.city.countryId);

    // Handle optional photo upload
    const photoPath = file ? await this.photoStorageService.savePhoto(file, 'products') : null;
    delete createProductDto.photo
    // Create product
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        image: photoPath,
        storeId: store.id,
      },
      select: this.getProductSelect(),
    });
  }

  /**
   * Update a product and optionally replace its photo.
   */
  async update(
    storeId: number,
    productId: number,
    updateProductDto: UpdateProductDto,
    userRole: Role,
    userCountryId?: number,
    file?: Express.Multer.File,
  ) {
    // Fetch store and validate product belongs to the store
    const store = await this.getStoreWithCountry(storeId);
    const product = await this.getProductInStore(productId, store.id);

    // Enforce permissions
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_PRODUCTS);
    this.rolePermissionService.enforceManageInCountry(userRole, Permission.EDIT_PRODUCTS, userCountryId, store.city.countryId);

    // Handle photo replacement
    let photoPath = product.image;
    if (file) {
      const newPhotoPath = await this.photoStorageService.savePhoto(file, 'products');
      if (photoPath) this.photoStorageService.deletePhoto(photoPath);
      photoPath = newPhotoPath;
    }

    // Update product
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...updateProductDto,
        image: photoPath,
      },
      select: this.getProductSelect(),
    });
  }

  /**
   * Delete a product and its associated photo.
   */
  async remove(storeId: number, productId: number, userRole: Role, userCountryId?: number) {
    // Fetch store and validate product belongs to the store
    const store = await this.getStoreWithCountry(storeId);
    const product = await this.getProductInStore(productId, store.id);

    // Enforce permissions
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_PRODUCTS);
    this.rolePermissionService.enforceManageInCountry(userRole, Permission.DELETE_PRODUCTS, userCountryId, store.city.countryId);

    // Delete photo and product
    if (product.image) {
      this.photoStorageService.deletePhoto(product.image);
    }

    return this.prisma.product.delete({
      where: { id: productId },
      select: { id: true, name: true },
    });
  }

  /**
   * Fetch all products for a store with filtering and pagination.
   */
  async findAll(
    storeId: number,
    query: QueryProductDto,
    userRole: Role,
    userCountryId?: number,
  ) {
    // Enforce RBAC for viewing products
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_PRODUCTS);
  
    // Validate store and fetch related countryId
    const store = await this.getStoreWithCountry(storeId);
  
    // Enforce country-level access control
    this.rolePermissionService.enforceManageInCountry(userRole, Permission.VIEW_PRODUCTS, userCountryId, store.city.countryId);
  
    // Build filters dynamically based on allowed fields and query
    const filters = buildFilters({
      userRole,
      userCountryId,
      dto: query,
      allowedFields: ['name', 'price', 'categoryId'],
    });
  
    // Include the storeId in filters
    filters.storeId = store.id;
  
    // Fetch paginated and sorted products
    return paginateAndSort(
      this.prisma.product,
      {
        where: filters,
        select: {
          id: true,
          name: true,
          price: true,
          categoryId: true,
          image: true,
          aproved: true,
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortField: query.sortField || 'name',
        sortOrder: query.sortOrder || 'asc',
      },
      ['name', 'price', 'createdAt', 'categoryId', 'store.name'],
    );
  }
  /**
   * Fetch a specific product by ID.
   */
  async findOne(storeId: number, productId: number, userRole: Role, userCountryId?: number) {
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_PRODUCTS);
    // Fetch store and validate product belongs to the store
    const store = await this.getStoreWithCountry(storeId);
    this.rolePermissionService.enforceManageInCountry(userRole, Permission.VIEW_PRODUCTS, userCountryId, store.city.countryId);
    const product = await this.getProductInStore(productId, store.id);

    // Enforce permissions

    return product;
  }

  // Utility methods

  private async getStoreWithCountry(storeId: number) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, city: { select: { countryId: true } } },
    });
    if (!store) throw new NotFoundException('Store not found.');
    return store;
  }

  private async getProductInStore(productId: number, storeId: number) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, storeId:storeId },
      select: this.getProductSelect(),
    });
    if (!product) throw new NotFoundException('Product not found in the specified store.');
    return product;
  }

  private getProductSelect() {
    return {
      id: true,
      name: true,
      price: true,
      categoryId: true,
      image: true,
      aproved: true,
      store: { select: { id: true, name: true } },
    };
  }
}
