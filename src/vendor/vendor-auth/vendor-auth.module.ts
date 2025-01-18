import { Module } from '@nestjs/common';
import { VendorAuthController } from './vendor-auth.controller';
import { VendorAuthService } from './vendor-auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { VendorJwtStrategy } from './strategy/vendorJwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [VendorAuthController],
  providers: [VendorAuthService,JwtService,VendorJwtStrategy]
})
export class VendorAuthModule {}
