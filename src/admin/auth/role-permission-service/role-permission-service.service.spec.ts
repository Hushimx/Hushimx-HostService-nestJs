import { RolePermissionService } from './role-permission-service.service';
import { Role } from './rolesData';
import { Permission } from './rolesData';
import { ForbiddenException } from '@nestjs/common';

describe('RolePermissionService', () => {
  let service: RolePermissionService;

  beforeEach(() => {
    service = new RolePermissionService();
  });

  it('should return true if a role has the required permission', () => {
    const result = service.hasPermission(Role.SUPER_ADMIN, Permission.ADMINS_CREATE);
    expect(result).toBe(true);
  });

  it('should return false if a role does not have thService rServicequired permission', () => {
    const result = service.hasPermission(Role.REGIONAL_ADMIN, Permission.ADMINS_CREATE);
    expect(result).toBe(false);
  });

  it('should throw ForbiddenException if a role does not have permission', () => {
    expect(() => {
      service.enforcePermission(Role.REGIONAL_ADMIN, Permission.ADMINS_CREATE);
    }).toThrow(ForbiddenException);
  });

  it('should not throw an exception if a role has the required permission', () => {
    expect(() => {
      service.enforcePermission(Role.SUPER_ADMIN, Permission.ADMINS_CREATE);
    }).not.toThrow();
  });

  it('should handle undefined roles gracefully', () => {
    const result = service.hasPermission('INVALID_ROLE' as Role, Permission.ADMINS_CREATE);
    expect(result).toBe(false);
  });

  it('should handle undefined permissions gracefully', () => {
    const result = service.hasPermission(Role.SUPER_ADMIN, 'INVALID_PERMISSION' as Permission);
    expect(result).toBe(false);
  });
});
