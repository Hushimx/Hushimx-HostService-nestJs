import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { OrderModule } from './order/order.module';

@Module({
  providers: [StoreService],
  controllers: [StoreController],
  imports: [OrderModule]
})
export class StoreModule {}
