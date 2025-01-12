import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WhatsAppService } from './whatsapp_notification.service';
import { CreateWhatsappNotificationDto } from './dto/create-whatsapp_notification.dto';
import { UpdateWhatsappNotificationDto } from './dto/update-whatsapp_notification.dto';

@Controller('dd')
export class WhatsappNotificationController {
  constructor(private readonly WhatsAppService: WhatsAppService) {}
  @Get()
  getHello(): string {
    return "hello"
  }

  @Post()
  create(@Body("number") num : string , @Body("message")Message : string) {
    return this.WhatsAppService.checkForNumber(num);
  }
}

//   @Get()
//   findAll() {
//     return this.whatsappNotificationService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.whatsappNotificationService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateWhatsappNotificationDto: UpdateWhatsappNotificationDto) {
//     return this.whatsappNotificationService.update(+id, updateWhatsappNotificationDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.whatsappNotificationService.remove(+id);
//   }
// }
