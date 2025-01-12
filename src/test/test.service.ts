import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class TestService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private readonly logger = new Logger(TestService.name);
  isWhatsAppReady = false;

  async onModuleInit() {
    this.logger.log('Initializing WhatsApp Client with timeout...');
    try {
      await Promise.race([
        this.initializeWhatsAppClient(),
        this.timeout(10000, 'WhatsApp client initialization timed out'), // Timeout after 10 seconds
      ]);
    } catch (error) {
      this.logger.error('Error in onModuleInit:', error);
    }
  }

  private async initializeWhatsAppClient() {
    try {
      this.client = new Client({
        puppeteer: { headless: true, args: ['--no-sandbox'] },
        authStrategy: new LocalAuth({
          clientId: '02',
        }),
      });

      this.client.on('qr', (qr) => {
        try {
          this.logger.log('WhatsApp QR Code:');
          qrcode.generate(qr, { small: true });
        } catch (error) {
          this.logger.error('Error handling QR event:', error);
        }
      });

      this.client.on('ready', () => {
        try {
          this.isWhatsAppReady = true;
          this.logger.log('WhatsApp is ready');
        } catch (error) {
          this.logger.error('Error handling ready event:', error);
        }
      });
      this.client.on('message', (message) => {
        try {
          this.logger.log(`Received message: ${message.body} ${message.from}`);
        } catch (error) {
          this.logger.error('Error handling message event:', error);
        } 
      })
      this.client.on('auth_failure', (msg) => {
        try {
          this.isWhatsAppReady = false;
          this.logger.error(`Authentication failure: ${msg}`);
        } catch (error) {
          this.logger.error('Error handling auth_failure event:', error);
        }
      });

      this.client.on('disconnected', (reason) => {
        try {
          this.isWhatsAppReady = false;
          this.logger.warn(`WhatsApp disconnected: ${reason}`);
          this.reinitializeClient();
        } catch (error) {
          this.logger.error('Error handling disconnected event:', error);
        }
      });

      await this.client.initialize();
    } catch (error) {
      this.logger.error('Error during WhatsApp client initialization:', error);
      throw error; // Re-throw to propagate to the caller
    }
  }

  private async reinitializeClient() {
    this.logger.log('Reinitializing WhatsApp client...');
    this.isWhatsAppReady = false;

    try {
      if (this.client) {
        await this.client.destroy();
      }
    } catch (error) {
      this.logger.error('Error during client destruction:', error);
    }

    try {
      await this.initializeWhatsAppClient();
    } catch (error) {
      this.logger.error('Error during client reinitialization:', error);
    }
  }

  private timeout(ms: number, message: string): Promise<void> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
  }

  async checkForNumber(phone: string): Promise<boolean> {
    try {
      if (!this.isWhatsAppReady) {
        throw new Error('WhatsApp is not ready');
      }
      return await this.client.isRegisteredUser(phone);
    } catch (error) {
      this.logger.error(`Error checking number ${phone}:`, error);
      return false; // Return a default value instead of throwing
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.logger.log('Destroying WhatsApp Client...');
      this.client.destroy().catch((error) => {
        this.logger.error('Error destroying WhatsApp client:', error);
      });
    }
  }
 async sendMessage(phone: string, message: string) {
    try {
      await this.client.sendMessage(phone, message);
      return true;
    } catch (error) {
      this.logger.error('Error sending message:', error);
      throw new Error('Failed to send WhatsApp message');
    }
  }
}
