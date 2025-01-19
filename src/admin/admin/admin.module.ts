import { Module } from '@nestjs/common';
import { AdminsService } from './admin.service';
import { AdminsController } from './admin.controller';

@Module({
  providers: [AdminsService],
  controllers: [AdminsController]
})
export class AdminsModule {}
