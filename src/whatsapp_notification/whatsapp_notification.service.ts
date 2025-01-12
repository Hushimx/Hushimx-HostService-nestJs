import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class WhatsAppService  {
    private client: Client;
    private prisma: PrismaClient;
    private isWhatsAppReady = false;
    @InjectQueue('whatsapp-queue') private whatsappQueue: Queue


    async notify(
        to: string,
        content: string,
        type: string,
        deliveryOrderId?: number,
        ServiceOrderId?: number,
      ) {
            const message = await this.prisma.message.create({
                data: {
                  to,
                  content,
                  type,
                  deliveryOrderId,
                  ServiceOrderId,
                },
              });
      
        // Add to the Bull queue for processing
        await this.whatsappQueue.add(
          'send-whatsapp-message',
          { id: message.id, to, content },
          {
            attempts: 5, // Retry 5 times
            backoff: { type: 'exponential', delay: 2000 }, // Retry with delay
          },
        );
    
        return message;
      }
    
    async sendMessage(phone: string, message: string): Promise<void> {
        try {
            await this.client.sendMessage(phone, message);
            console.log(`Message sent to ${phone}`);
        } catch (error) {
            console.error('Error sending message:', error);
            throw new Error('Failed to send WhatsApp message');
        }
    }
    async checkForNumber(phone: string): Promise<Boolean> {
      if(this.isWhatsAppReady) {
        return await this.client.isRegisteredUser(phone);
      }else{
        throw new Error('WhatsApp is not ready');
      }
      }
}
