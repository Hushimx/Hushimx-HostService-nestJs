import { Global, Module } from '@nestjs/common';
import { PhotoStorageService } from './photo-storage.service';
import { PhotoStorageController } from './photo-storage.controller';

@Global()
@Module({
  providers: [PhotoStorageService],
  exports: [PhotoStorageService],
  controllers: [PhotoStorageController],
})
export class PhotoStorageModule {}
