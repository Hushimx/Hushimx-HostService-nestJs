import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { JwtModule } from '@nestjs/jwt';
import { StoreModule } from '../store/store.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [JwtModule.register({}), StoreModule, EventModule],

  providers: [ClientService],
  controllers: [ClientController],
})
export class ClientModule {}
