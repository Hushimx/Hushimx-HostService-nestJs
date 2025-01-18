import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../role-permission-service/rolesData'; // Enum for roles

@Injectable()
export class AdminJwt extends AuthGuard('adminjwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Run the default JWT AuthGuard logic
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) return false;

    // Get the request object
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Ensure the user has one of the required roles
    const allowedRoles = [Role.SUPER_ADMIN, Role.REGIONAL_ADMIN];
    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have the required permissions.');
    }

    return true;
  }
}
