import { Module } from '@nestjs/common';
import { ServicesOrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  controllers: [OrdersController],
  providers: [ServicesOrdersService],
})
export class OrdersModule {}
