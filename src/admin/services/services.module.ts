import { Module } from '@nestjs/common';
import { ListModule } from './list/list.module';
import { OrdersModule } from './orders/orders.module';
import { CitiesModule } from './cities/cities.module';

@Module({
  imports: [ListModule, OrdersModule, CitiesModule]
})
export class ServicesModule {}
