import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module';
import { CityModule } from './city/city.module';
import { HotelsModule } from './hotels/hotels.module';
import { AdminsModule } from './admin/admin.module';
import { RoomsModule } from './rooms/rooms.module';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { OrdersModule } from './orders/orders.module';
import { VendorModule } from './vendor/vendor.module';
import { ProductModule } from './product/product.module';
import { ServicesModule } from './services/services.module';
import { HotelsService } from './hotels/hotels.service';
import { HotelsController } from './hotels/hotels.controller';
import { VendorController } from './vendor/vendor.controller';
import { ProductController } from './product/product.controller';
import { ServiceController } from './services/services.controller';
import { RoomsController } from './rooms/rooms.controller';
import { AdminController } from './admin/admin.controller'; // Admin Controller
import { AdminService } from './admin/admin.service'; // Admin Service
import { RoomsService } from './rooms/rooms.service'; // Rooms Service
import { CountryService } from './country/country.service'; // Country Service
import { CityService } from './city/city.service'; // City Service
import { VendorService } from './vendor/vendor.service'; // Vendor Service
import { ProductService } from './product/product.service'; // Product Service
import { ServiceService } from './services/services.service'; // Services Service

@Module({
  imports: [
    CountryModule,
    CityModule,
    HotelsModule,
    AdminsModule,
    RoomsModule,
    OrdersModule,
    VendorModule,
    ProductModule,
    ServicesModule,
  ],
  controllers: [
    AdminController, // Add Admin Controller
    HotelsController,
    RoomsController, // Add Rooms Controller 
    ProductController, // Add Product Controller
    OrdersController,
    ServiceController, // Add Services Controller
    VendorController, // Add Vendor Controller
  ],
  providers: [
    HotelsService,
    RoomsService,
    CountryService, // Add Country Service
    OrdersService,
    CityService, // Add City Service
    VendorService, // Add Vendor Service
    ProductService, // Add Product Service
    ServiceService, // Add Services Service
    AdminService, // Add Admin Service
  ],
})
export class AdminModule {}
