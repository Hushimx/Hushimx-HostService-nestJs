import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappNotificationController } from './whatsapp_notification.controller';
import { WhatsappNotificationService } from './whatsapp_notification.service';

describe('WhatsappNotificationController', () => {
  let controller: WhatsappNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappNotificationController],
      providers: [WhatsappNotificationService],
    }).compile();

    controller = module.get<WhatsappNotificationController>(WhatsappNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
