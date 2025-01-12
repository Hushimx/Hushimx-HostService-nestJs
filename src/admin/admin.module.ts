import { ProductService } from './product/product.service';
import { Module } from '@nestjs/common';
import { HotelsModule } from './hotels/hotels.module';
import { AdminsModule } from './admin/admin.module';
import { RoomsModule } from './rooms/rooms.module';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { OrdersModule } from './orders/orders.module';
import { VendorModule } from './vendor/vendor.module';
import { ProductModule } from './product/product.module';
import { HotelsService } from './hotels/hotels.service';
import { HotelsController } from './hotels/hotels.controller';
import { VendorController } from './vendor/vendor.controller';
import { ProductController } from './product/product.controller';
import { RoomsController } from './rooms/rooms.controller';
import { AdminController } from './admin/admin.controller'; // Admin Controller
import { AdminService } from './admin/admin.service'; // Admin Service
import { RoomsService } from './rooms/rooms.service'; // Rooms Service
import { CountriesService } from './countries/countries.service'; // Country Service
import { CitiesService  } from './countries/cities/cities.service'; // City Service
import { VendorService } from './vendor/vendor.service'; // Vendor Service
import { CategoriesModule } from './categories/categories.module';
import { CountriesModule } from './countries/countries.module';
import { CitiesModule } from './countries/cities/cities.module';
import { DriversModule } from './drivers/drivers.module';
import { DriversController } from './drivers/drivers.controller';
import { DriversService } from './drivers/drivers.service';
import { StoresModule } from './stores/stores.module';
import { StoresController } from './stores/stores.controller';
import { ClientsModule } from './clients/clients.module';
import { ServicesModule } from './services/services.module';
import { ServiceService } from 'src/service/service.service';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    HotelsModule,
    AdminsModule,
    RoomsModule,
    OrdersModule,
    VendorModule,
    ProductModule,
    ServicesModule,
    CategoriesModule,
    CountriesModule,
    CitiesModule,
    DriversModule,
    StoresModule,
    ClientsModule,
    EventModule,
  ],
  controllers: [
    AdminController, // Add Admin Controller
    HotelsController,
    RoomsController, // Add Rooms Controller 
    ProductController, // Add Product Controller
    OrdersController,
    VendorController, // Add Vendor Controller
    DriversController,
    StoresController
  ],
  providers: [
    HotelsService,
    RoomsService,
    CountriesService, // Add Country Service
    OrdersService,
    CitiesService, // Add City Service
    VendorService, // Add Vendor Service
    ServiceService, // Add Services Service
    ProductService,
    AdminService, // Add Admin Service
    DriversService
  ],
})
export class AdminModule {}
