import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { AuthModule } from './admin/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CryptoModule } from './crypto/crypto.module';
import { AdminModule } from './admin/admin.module';
import { ClientModule } from './client/client.module';
import { ServiceModule } from './client/service/service.module';
import { RolePermissionServiceModule } from './admin/auth/role-permission-service/role-permission-service.module';
import { PaymentMethodsModule } from './client/payment-methods/payment-methods.module';
import { WhatsappNotificationModule } from './whatsapp_notification/whatsapp_notification.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TestModule } from './wwebjs/wwebjs.module';
import { PhotoStorageModule } from './photo-storage/photo-storage.module';
import { VendorModule } from './vendor/vendor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, 'uploads'), // Ensure this path matches your file structure
    //   serveRoot: '/images', // Optional: specify a custom route prefix
    // }),
    BullModule.forRoot({
      redis: { host: '127.0.0.1', port: 6379 },
    }),
    AuthModule,
    // BookmarkModule,
    PrismaModule,
    CryptoModule,
    AdminModule,
    ClientModule,
    ServiceModule,
    RolePermissionServiceModule,
    PaymentMethodsModule,
    WhatsappNotificationModule,
    TestModule,
    PhotoStorageModule,
    VendorModule,
  ],
})
export class AppModule {}
