import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
/*************  ✨ Codeium Command ⭐  *************/
  /**
   * Creates a new upload record.
   * @param createUploadDto - Dto containing the new upload's properties.
   * @returns The newly created upload record.
   */
/******  49680624-b301-4985-93bb-49fb59863471  *******/export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log('Uploaded File:', file);
    console.log('Form Data:', body);
    // Further processing...
  }
}
