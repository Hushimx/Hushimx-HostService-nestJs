import { Global, Module } from '@nestjs/common';
import { WwebjsService } from './wwebjs.service';


@Global()
@Module({
  providers: [WwebjsService],
  exports: [WwebjsService],
})
export class TestModule {}
