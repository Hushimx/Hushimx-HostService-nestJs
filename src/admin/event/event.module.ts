import { Module } from '@nestjs/common';
import { EventsService } from './event.service';
import { EventController } from './event.controller';

@Module({
  controllers: [EventController],
  providers: [EventsService],
})
export class EventModule {}
