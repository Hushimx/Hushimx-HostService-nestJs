import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto,UpdateCategoryDto } from '../dto/Categories.dto';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service'; // Adjust path as needed
import { Role, Permission } from 'src/auth/role-permission-service/rolesData'; // Adjust path as needed

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  // Helper to fetch store by slug
  private async findStoreBySlug(storeSlug: string) {
    const store = await this.prisma.store.findUnique({
      where: { uuid: storeSlug },
      select: { id: true },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async create(
    storeSlug: string,
    createCategoryDto: CreateCategoryDto,
    userRole: Role,
    userCountryId?: number,
  ) {
    // Ensure user can create categories
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_CATEGORIES);

    const store = await this.findStoreBySlug(storeSlug);

    return this.prisma.productsCategory.create({
      data: {
        name: createCategoryDto.name,
        storeId: store.id,
      },
    });
  }

  async findAll(storeSlug: string, userRole: Role) {
    // Ensure user can read categories
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_CATEGORIES);

    const store = await this.findStoreBySlug(storeSlug);

    return this.prisma.productsCategory.findMany({
      where: { storeId: store.id },
    });
  }

  async findOne(storeSlug: string, id: number, userRole: Role) {
    // Ensure user can read categories
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_CATEGORIES);

    const store = await this.findStoreBySlug(storeSlug);

    return this.prisma.productsCategory.findFirst({
      where: { id, storeId: store.id },

    });
  }

  async update(
    storeSlug: string,
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    userRole: Role,
    userCountryId?: number,
  ) {
    // Ensure user can edit categories
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_CATEGORIES);

    const store = await this.findStoreBySlug(storeSlug);

    const category = await this.prisma.productsCategory.findFirst({
      where: { id, storeId: store.id },
    });
    if (!category) {
      return null;
    }

    return this.prisma.productsCategory.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(storeSlug: string, id: number, userRole: Role, userCountryId?: number) {
    // Ensure user can delete categories
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_CATEGORIES);

    const store = await this.findStoreBySlug(storeSlug);

    const category = await this.prisma.productsCategory.findFirst({
      where: { id, storeId: store.id },
    });
    if (!category) {
      return null;
    }

    return this.prisma.productsCategory.delete({
      where: { id },
    });
  }
}
