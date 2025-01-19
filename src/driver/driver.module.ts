import { Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { ServicesOrdersService } from 'src/admin/services/orders/orders.service';
import { OrdersService } from 'src/admin/orders/orders.service';

@Module({
  controllers: [DriverController],
  providers: [DriverService,ServicesOrdersService,OrdersService],
})
export class DriverModule {}
