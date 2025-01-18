import { Global, Module } from '@nestjs/common';
import { RolePermissionService } from './role-permission-service.service';


@Global()
@Module({
  providers: [RolePermissionService],
  exports: [RolePermissionService],
})
export class RolePermissionServiceModule {}
