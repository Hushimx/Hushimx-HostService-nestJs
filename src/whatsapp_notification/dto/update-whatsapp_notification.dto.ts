import { PartialType } from '@nestjs/swagger';
import { CreateWhatsappNotificationDto } from './create-whatsapp_notification.dto';

export class UpdateWhatsappNotificationDto extends PartialType(CreateWhatsappNotificationDto) {}
