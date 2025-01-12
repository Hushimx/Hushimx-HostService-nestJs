import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp_notification.service';
import { BullModule } from '@nestjs/bull';
// import { WhatsappNotificationController } from './whatsapp_notification.controller';

@Module({
  imports: [    BullModule.registerQueue({
    name: 'whatsapp-queue',
    redis: { host: '127.0.0.1', port: 6379 }, // Redis connection
  })],
  // controllers: [WhatsappNotificationController],
  providers: [WhatsAppService],
})
export class WhatsappNotificationModule {}
