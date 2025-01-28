import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RolePermissionService } from 'src/admin/auth/role-permission-service/role-permission-service.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VendorService {
    constructor(private readonly prisma: PrismaService, private readonly rolePermissionService: RolePermissionService){}

    async getAdminOverview(vendorId) {

        const vendor = await this.prisma.vendor.findUnique({
          where: { id: vendorId },
          select:{
            city: {
              select: {
                country: {
                  select: {
                    currency: true,
                  },
                },
              },
            },
          }
        });

        if (!vendor) {  
          throw new NotFoundException('Vendor not found');
        }

        const country = vendor.city.country;


        const [deliveryOrdersCount, serviceOrdersCount,  totalRevenue] = await Promise.all([
          this.prisma.deliveryOrder.count({
            where: { vendorId: vendorId },
          }),
          this.prisma.serviceOrder.count({
            where: { vendorId: vendorId },
          }),

          this.prisma.deliveryOrder.aggregate({
            _sum: { total: true },
            where: { vendorId: vendorId },
          }).then((res) => res._sum.total || 0),
        ]);
    
    
    
        return {
          deliveryOrdersCount,
          serviceOrdersCount,
          totalRevenue,
          currency: country.currency,
        };
      }

}
