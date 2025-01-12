import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HostModule } from './host/host.module';
import { CryptoModule } from './crypto/crypto.module';
import { AdminModule } from './admin/admin.module';
import { ClientModule } from './client/client.module';
import { ServiceModule } from './service/service.module';
import { RolePermissionServiceModule } from './auth/role-permission-service/role-permission-service.module';
import { UploadAssetsModule } from './upload-assets/upload-assets.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { WhatsappNotificationModule } from './whatsapp_notification/whatsapp_notification.module';
import { UploadModule } from './test/upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TestModule } from './test/test.module';
import { PhotoStorageModule } from './photo-storage/photo-storage.module';
import { VendorModule } from './vendor/vendor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'uploads'), // Ensure this path matches your file structure
      serveRoot: '/images', // Optional: specify a custom route prefix
    }),
    BullModule.forRoot({
      redis: { host: '127.0.0.1', port: 6379 },
    }),
    AuthModule,
    // BookmarkModule,
    PrismaModule,
    HostModule,
    CryptoModule,
    AdminModule,
    ClientModule,
    ServiceModule,
    RolePermissionServiceModule,
    UploadAssetsModule,
    PaymentMethodsModule,
    WhatsappNotificationModule,
    UploadModule,
    TestModule,
    PhotoStorageModule,
    VendorModule,
  ],
})
export class AppModule {}
