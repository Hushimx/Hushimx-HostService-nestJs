import { Controller, ForbiddenException, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PhotoStorageService } from './photo-storage.service';

@Controller('images')
export class PhotoStorageController {
    constructor(private readonly photoService: PhotoStorageService) {}

    @Get(':subDir/:fileName')
    @ApiOperation({ summary: 'Retrieve a photo securely' })
    @ApiResponse({ status: 200, description: 'Photo retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized access.' })
    @ApiResponse({ status: 404, description: 'Photo not found.' })
    async getPhoto(
      @Param('subDir') subDir: string,
      @Param('fileName') fileName: string,
      @Res() res: Response,
    ) {
      try {
        // Securely fetch the photo
        const photoPath = `${subDir}/${fileName}`;
        const { stream, mimeType } = this.photoService.getPhotoStream(photoPath);
  
        // Set appropriate headers
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
  
        // Pipe the photo stream to the response
        stream.pipe(res);
      } catch (error) {
        if (error instanceof NotFoundException || error instanceof ForbiddenException) {
          throw error;
        }
        throw new NotFoundException('Photo not found or cannot be accessed');
      }
    }

}
