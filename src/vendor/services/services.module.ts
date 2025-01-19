import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CitiesController } from './services.controller';

@Module({
  controllers: [CitiesController],
  providers: [ServicesService],
})
export class ServicesModule {}
