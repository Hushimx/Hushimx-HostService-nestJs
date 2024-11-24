import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto, EditAdminDto } from 'src/admin/dto/admin.dto';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // Fetch all admins
  async getAdmins() {
    return this.prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'REGIONAL_ADMIN'] }, // Fetch only admins
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        countryId: true,
      },
    });
  }

  // Create a new admin
  async createAdmin(dto: CreateAdminDto, userRole: Role) {
    if (userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can create admins.');
    }

    const { email, password, firstName, lastName, role, countryId } = dto;
    const userRoleEnum = role as Role;

    // Validate that countryId is provided for REGIONAL_ADMIN
    if (role === 'REGIONAL_ADMIN' && !countryId) {
      throw new ForbiddenException('Country ID is required for REGIONAL_ADMIN.');
    }

    // Hash the password
    const hashedPassword = await argon2.hash(password);

    // Create the admin
    const admin = await this.prisma.user.create({
      data: {
        email,
        hash: hashedPassword,
        firstName,
        lastName,
        role : userRoleEnum,
        countryId: role === 'REGIONAL_ADMIN' ? countryId : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        countryId: true,
      },
    });

    return admin;
  }

  // Edit an existing admin
  async editAdmin(adminId: number, dto: EditAdminDto, userRole: string) {
    if (userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can edit this resource.');
    }

    const { email, password, firstName, lastName, role , countryId } = dto;
    const userRoleEnum = role as Role;

    // Fetch the existing admin
    const existingAdmin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!existingAdmin) {
      throw new NotFoundException('Admin not found.');
    }

    // Validate countryId for REGIONAL_ADMIN
    if (role === 'REGIONAL_ADMIN' && !countryId) {
      throw new ForbiddenException('Country ID is required for REGIONAL_ADMIN.');
    }

    const hashedPassword = password ? await argon2.hash(password) : undefined;

    // Update the admin
    const updatedAdmin = await this.prisma.user.update({
      where: { id: adminId },
      data: {
        email,
        hash: hashedPassword,
        firstName,
        lastName,
        role : userRoleEnum,
        countryId: role === 'REGIONAL_ADMIN' ? countryId : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        countryId: true,
      },
    });

    return updatedAdmin;
  }

  // Delete an admin
  async deleteAdmin(adminId: number, userRole: string) {
    if (userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can delete admins.');
    }

    // Fetch the admin to delete
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, email: true }, // Only select necessary fields
    });

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    // Delete the admin
    await this.prisma.user.delete({
      where: { id: adminId },
    });

    return {
      message: `Admin with email ${admin.email} has been deleted.`,
    };
  }
}
