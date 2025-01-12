import { Test, TestingModule } from '@nestjs/testing';
import { HotelsService } from './hotels.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RolePermissionService } from 'src/auth/role-permission-service/role-permission-service.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from 'src/auth/role-permission-service/rolesData';

describe('HotelsService', () => {
  let service: HotelsService;
  let prisma: PrismaService;
  let rolePermissionService: RolePermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelsService,
        {
          provide: PrismaService,
          useValue: {
            hotel: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            city: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: RolePermissionService,
          useValue: {
            enforcePermission: jest.fn(),
            enforceManageInCountry: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
    prisma = module.get<PrismaService>(PrismaService);
    rolePermissionService = module.get<RolePermissionService>(RolePermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHotels', () => {
    it('should enforce view permission', async () => {
      const query = { page: 1, limit: 10 };
      const userRole : Role = Role.REGIONAL_ADMIN;
      const userCountryId = 1;

      await service.getHotels(query, userRole, userCountryId);

      expect(rolePermissionService.enforcePermission).toHaveBeenCalledWith(userRole, 'view_hotels');
    });
  });

  describe('createHotel', () => {
    it('should enforce create permission and manage-in-country check', async () => {
      const dto = { name: 'Test Hotel', cityId: 1 };
      const userRole : Role = Role.REGIONAL_ADMIN;
      const userCountryId = 1;

      prisma.city.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        country: { id: 1 },
      });

      await service.createHotel(dto, userRole, userCountryId);

      expect(rolePermissionService.enforcePermission).toHaveBeenCalledWith(userRole, 'create_hotels');
      expect(rolePermissionService.enforceManageInCountry).toHaveBeenCalledWith(
        userRole,
        'create_hotels',
        userCountryId,
        1,
      );
      expect(prisma.hotel.create).toHaveBeenCalledWith({ data: { name: 'Test Hotel', cityId: 1 } });
    });

    it('should throw an error if city is not found', async () => {
      prisma.city.findUnique = jest.fn().mockResolvedValue(null);
      const dto = { name: 'Test Hotel', cityId: 1 };
      const userRole : Role = Role.REGIONAL_ADMIN;
      const userCountryId = 1;

      await expect(service.createHotel(dto, userRole, userCountryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
