import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestModule } from 'src/wwebjs/wwebjs.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
    controllers: [OrdersController],
    providers: [OrdersService]
})
export class DeliveryOrdersModule {}
