import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class VendorJwt extends AuthGuard('vendorjwt') implements CanActivate {
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



    return true;
  }
}
