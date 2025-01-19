import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrderManagementModule } from 'src/order-management/order-management.module';
import { OrderManagementService } from 'src/order-management/order-management.service';
import { WwebjsModule } from 'src/wwebjs/wwebjs.module';

@Module({
    imports: [OrderManagementModule],
})
export class OrdersModule {}
