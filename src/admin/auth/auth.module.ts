import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminJwtStrategy } from './strategy/adminJwt.strategy';
import { ClientJwtStrategy } from '../../client/strategy/clientJwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AdminJwtStrategy],
})
export class AuthModule {}
