import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolePermissionService } from './auth/role-permission-service/role-permission-service.service';
import { Permission } from './auth/role-permission-service/rolesData';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService, private readonly rolePermissionService: RolePermissionService,
 ) {}

 async getAdminOverview(userRole, userCountryId: number, countryId: number) {
    // Validate countryId
    if (!countryId || typeof countryId !== 'number') {
      throw new Error('Invalid country ID');
    }

    // Enforce RBAC with permission validation
    try {
      this.rolePermissionService.enforceManageInCountry(
        userRole,
        Permission.ACCESS_OVERVIEW,
        userCountryId,
        countryId
      );
    } catch (err) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    // Fetch country details
    const country = await this.prisma.country.findUnique({
      where: { id: countryId },
      select: { currency: true },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    // Fetch aggregated data
    const [deliveryOrdersCount, serviceOrdersCount, totalClients, totalRevenue] = await Promise.all([
      this.prisma.deliveryOrder.count({
        where: { city: { countryId } },
      }),
      this.prisma.serviceOrder.count({
        where: { city: { countryId } },
      }),
      this.prisma.client.count({
        where: { country: { id: countryId } },
      }),
      this.prisma.deliveryOrder.aggregate({
        _sum: { total: true },
        where: { city: { countryId } },
      }).then((res) => res._sum.total || 0),
    ]);



    return {
      deliveryOrdersCount,
      serviceOrdersCount,
      totalClients,
      totalRevenue,
      currency: country.currency,
    };
  }
}
