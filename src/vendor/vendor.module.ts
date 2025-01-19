import { Module } from '@nestjs/common';
import { StoresModule } from './stores/stores.module';
import { VendorAuthModule } from './vendor-auth/vendor-auth.module';
import { ProductModule } from './products/product.module';
import { DeliveryOrdersModule } from './orders/delivery/orders.module';
import { ServiceOrdersModule } from './orders/services/orders.module';
import { VendorController } from './vendor.controller';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [StoresModule, VendorAuthModule,ProductModule,DeliveryOrdersModule,ServiceOrdersModule,ServicesModule],
  controllers: [VendorController]
})
export class VendorModule {}
