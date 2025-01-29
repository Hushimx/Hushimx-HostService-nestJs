import { Injectable, ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginateAndSort, PaginatedResult } from 'src/utils/pagination';
import { CreateVendorDto, QueryVendorDto, UpdateVendorDto } from '../dto/vendor.dto';
import { RolePermissionService } from 'src/admin/auth/role-permission-service/role-permission-service.service';
import { Permission, Role } from 'src/admin/auth/role-permission-service/rolesData';
import { buildFilters } from 'src/utils/filters';
import { WwebjsService } from 'src/wwebjs/wwebjs.service';

@Injectable()
export class VendorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly wwebjsService: WwebjsService
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
    try {
      const isValid = await this.wwebjsService.checkForNumber(createVendorDto.phoneNo);
      if (!isValid) {
        throw new BadRequestException({
          code: "INVALID_WHATSAPP_NUMBER",
          message: 'Phone number is not valid',
        });
      }
    } catch (error) {
      if (error.code === 'INVALID_WHATSAPP_NUMBER') {
        throw error;
      }
      throw new BadRequestException({
        code: "WHATSAPP_ERROR",
        message: 'WhatsApp bots doesn\'t work',
      });
    }

    // Hash the password (if applicable)
    const hashedPassword = await this.hashPassword(createVendorDto.password);
  
    // Create the vendor
    try{
      const vendor = await this.prisma.vendor.create({
        data: {
          email: createVendorDto.email,
          password: hashedPassword,
          name: createVendorDto.name,
          phoneNo: createVendorDto.phoneNo,
          address: createVendorDto.address,
          cityId: createVendorDto.cityId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNo: true,
          address: true,
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
      return vendor
  
    }catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException({
              code:"EMAIL_CONFLICT",
              message:"Email is already registed"
});
      }
      throw error;
    }
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
    if(updateVendorDto.phoneNo){
      try {
        const isValid = await this.wwebjsService.checkForNumber(updateVendorDto.phoneNo);
        if (!isValid) {
          throw new BadRequestException({
            code: "INVALID_WHATSAPP_NUMBER",
            message: 'Phone number is not valid',
          });
      
        }
      } catch (error) {
        if (error.code === 'INVALID_WHATSAPP_NUMBER') {
          throw error;
        }
        throw new BadRequestException({
          code: "WHATSAPP_ERROR",
          message: 'WhatsApp bots doesn\'t work',
        });
      }  
    }
    // Prepare update data
    const updateData: any = { ...updateVendorDto };
  
    // Hash the password if it's being updated
    if (updateVendorDto.password) {
      updateData.password = await this.hashPassword(updateVendorDto.password);
    } else {
      delete updateData.password; // Ensure password is not included if not provided
    }
  
    // Update the vendor
    try{
      const updatedVendor = await this.prisma.vendor.update({
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
      return updatedVendor
    }catch(e){
      if (e.code === 'P2002') {
        throw new ConflictException({
code:"EMAIL_CONFLICT",
message:"Email is already registed"

});
      }
      throw e
    }
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
