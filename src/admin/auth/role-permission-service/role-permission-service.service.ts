import { Injectable, ForbiddenException } from '@nestjs/common';
import { Role,Permission,RolePermissions } from './rolesData';

@Injectable()
export class RolePermissionService {
  // Check if a role has a specific permission
  hasPermission(role: Role, permission: Permission): boolean {
    const permissions = RolePermissions[role] || [];
    return permissions.includes(permission);
  }

  // Enforce a permission, throwing an error if not allowed
  enforcePermission(role: Role, permission: Permission): void {
    if (!this.hasPermission(role, permission)) {
      throw new ForbiddenException(`Permission '${permission}' is not allowed for role '${role}'.`);
    }
  }

  // Check if a role can manage a resource in the given country
  canManageInCountry(
    role: Role,
    permission: Permission,
    userCountryId: number | undefined,
    resourceCountryId: number,
  ): boolean {
    if (this.hasPermission(role, permission)) {
      if (this.hasPermission(role, Permission.ACCESS_ALL_HOTELS)) {
        return true;
      }

      if (userCountryId === resourceCountryId) {
        return true;
      }
    }

    return false; // Deny access if no conditions are met
  }

  // Enforce country-specific management permission
  enforceManageInCountry(
    role: Role,
    permission: Permission,
    userCountryId: number | undefined,
    resourceCountryId: number,
  ): void {
    if (!this.canManageInCountry(role, permission, userCountryId, resourceCountryId)) {
      throw new ForbiddenException(
        `Role '${role}' does not have permission '${permission}' to manage resources in this country.`,
      );
    }
  }
}
