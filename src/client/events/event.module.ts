import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventsController } from './event.controller';

@Module({
  controllers: [EventsController],
  providers: [EventService],
})
export class EventModule {}
