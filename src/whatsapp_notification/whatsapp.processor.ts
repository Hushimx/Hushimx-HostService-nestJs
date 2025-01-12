import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from './whatsapp_notification.service';

@Processor('whatsapp-queue')
export class WhatsAppProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Process('send-whatsapp-message')
  async processMessage(job: Job) {
    const { id, phone, content } = job.data;

    try {
      await this.whatsappService.sendMessage(phone, content);

      // Update status to SENT
      await this.prisma.message.update({
        where: { id },
        data: { status: 'SENT' },
      });

      console.log(`Message ID ${id} sent successfully to ${phone}`);
    } catch (error) {
      console.error(`Failed to send message ID ${id}:`, error.message);

      // Mark as FAILED if retries are exhausted
      if (job.attemptsMade >= job.opts.attempts) {
        await this.prisma.message.update({
          where: { id },
          data: { status: 'FAILED' },
        });
      }

      throw error; // Trigger retry
    }
  }
}
