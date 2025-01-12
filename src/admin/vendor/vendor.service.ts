import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginateAndSort, PaginatedResult } from 'src/utils/pagination';
import { CreateVendorDto, QueryVendorDto, UpdateVendorDto } from '../dto/vendor.dto';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/auth/role-permission-service/rolesData';
import { buildFilters } from 'src/utils/filters';

@Injectable()
export class VendorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  /**
   * Create a new vendor
   */
  async create(createVendorDto: CreateVendorDto, userRole: Role, userCountryId?: number) {
    // Enforce create permission
    this.rolePermissionService.enforcePermission(userRole, Permission.CREATE_VENDORS);
  
    // Validate the city and enforce country-specific access
    const city = await this.prisma.city.findUnique({
      where: { id: createVendorDto.cityId },
      select: { countryId: true },
    });
  
    if (!city) {
      throw new NotFoundException('City not found.');
    }
  
    // Enforce RBAC for country-specific access
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.CREATE_VENDORS,
      userCountryId,
      city.countryId,
    );
  
    // Hash the password (if applicable)
    const hashedPassword = await this.hashPassword(createVendorDto.password);
  
    // Create the vendor
    return this.prisma.vendor.create({
      data: {
        email: createVendorDto.email,
        password: hashedPassword,
        name: createVendorDto.name,
        phoneNo: createVendorDto.phoneNo,
        address: createVendorDto.address,
        cityId: createVendorDto.cityId,
        locationUrl: createVendorDto.locationUrl || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNo: true,
        address: true,
        locationUrl: true,
        city: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
  
  // Helper method for password hashing (if required)
  private async hashPassword(password: string): Promise<string> {
    return require('argon2').hash(password);
  }
  /**
   * Retrieve vendors with pagination, sorting, and filtering
   */
  async findAll(
    dto: QueryVendorDto,
    userRole: Role,
    userCountryId?: number,
  ): Promise<PaginatedResult<any>> {
    // Enforce view permission
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_VENDORS);

    // Apply filters
    const filters = buildFilters({
      userRole,
      userCountryId,
      dto,
      allowedFields: ['name', 'email','phoneNo'], // Fields allowed for filtering
    });






    return paginateAndSort(
      this.prisma.vendor,
      {
        where: filters,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNo: true,
          address: true,
          locationUrl: true,
          city: {
            select: {
              id: true,
              name: true,
            },
          },
        }
      },
      {
        page: dto.page || 1,
        limit: dto.limit || 10,
        sortField: dto.sortField,
        sortOrder: dto.sortOrder,
      },
      ['name', 'cityId', 'createdAt'],
    );
  }

  /**
   * Retrieve a single vendor by ID
   */
  async findOne(id: number, userRole: Role, userCountryId?: number) {
    // Enforce view permission
    this.rolePermissionService.enforcePermission(userRole, Permission.VIEW_VENDORS);

    // Fetch the vendor and validate access
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: { city: { select: { countryId: true } } },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found.');
    }

    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.VIEW_VENDORS,
      userCountryId,
      vendor.city.countryId,
    );
    delete vendor.password;
    return vendor;
  }

  /**
   * Update an existing vendor
   */
  async update(
    vendorId: number,
    updateVendorDto: UpdateVendorDto & { password?: string },
    userRole: Role,
    userCountryId?: number,
  ) {
    // Enforce update permission
    this.rolePermissionService.enforcePermission(userRole, Permission.EDIT_VENDORS);
  
    // Validate the vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { city: { select: { countryId: true } } },
    });
  
    if (!vendor) {
      throw new NotFoundException('Vendor not found.');
    }
  
    // Enforce country-specific access
    this.rolePermissionService.enforceManageInCountry(
      userRole,
      Permission.EDIT_VENDORS,
      userCountryId,
      vendor.city.countryId,
    );
  
    // Prepare update data
    const updateData: any = { ...updateVendorDto };
  
    // Hash the password if it's being updated
    if (updateVendorDto.password) {
      updateData.password = await this.hashPassword(updateVendorDto.password);
    } else {
      delete updateData.password; // Ensure password is not included if not provided
    }
  
    // Update the vendor
    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email:true,
        phoneNo: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
  

  /**
   * Delete a vendor
   */
  async remove(id: number, userRole: Role, userCountryId?: number) {
    // Enforce delete permission
    this.rolePermissionService.enforcePermission(userRole, Permission.DELETE_VENDORS);

    // Validate access to the vendor
    await this.findOne(id, userRole, userCountryId);

    return this.prisma.vendor.delete({
      where: { id },
    });
  }
}
