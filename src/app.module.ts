import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { HostModule } from './host/host.module';
import { CryptoModule } from './crypto/crypto.module';
import { AdminModule } from './admin/admin.module';
import { ClientModule } from './client/client.module';
import { ServiceModule } from './service/service.module';
import { ServiceOrdersModule } from './admin/service-orders/service-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    BookmarkModule,
    PrismaModule,
    HostModule,
    CryptoModule,
    AdminModule,
    ClientModule,
    ServiceModule,
    ServiceOrdersModule,
  ],
})
export class AppModule {}
