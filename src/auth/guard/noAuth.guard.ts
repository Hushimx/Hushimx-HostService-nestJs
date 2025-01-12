import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../role-permission-service/rolesData'; // Enum for roles

@Injectable()
export class NoAuthGuard extends AuthGuard('adminjwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Run the default JWT AuthGuard logic
    const isAuthenticated = await super.canActivate(context);
    console.log(isAuthenticated)
    if (!isAuthenticated) return true;

    return false;
  }
}
