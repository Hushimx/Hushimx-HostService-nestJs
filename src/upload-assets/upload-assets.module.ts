import { Global, Module } from '@nestjs/common';
import { UploadService } from './upload-assets.service';

@Global()
@Module({
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadAssetsModule {}
