import { Module } from '@nestjs/common';
import { ServicesOrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderManagementModule } from 'src/order-management/order-management.module';

@Module({
  controllers: [OrdersController],
  providers: [ServicesOrdersService],
  imports: [OrderManagementModule],
})
export class OrdersModule {}
