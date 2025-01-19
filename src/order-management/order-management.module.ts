import { Global, Module } from '@nestjs/common';
import { OrderManagementService } from './order-management.service';
import { WwebjsService } from 'src/wwebjs/wwebjs.service';
import { WwebjsModule } from 'src/wwebjs/wwebjs.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    providers: [OrderManagementService, PrismaService], // Provide WhatsAppService directly
    exports: [OrderManagementService],
    })
export class OrderManagementModule {}
