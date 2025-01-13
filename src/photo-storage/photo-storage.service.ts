import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, extname, normalize, resolve } from 'path';
import * as sharp from 'sharp';

// Use require for sanitize-filename
const sanitize = require('sanitize-filename');

@Injectable()
export class PhotoStorageService {
  private readonly baseUploadDir = './uploads';

  constructor() {
    if (!existsSync(this.baseUploadDir)) {
      mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  async savePhoto(file: Express.Multer.File, subDir: string): Promise<string> {
    const uploadDir = join('src',this.baseUploadDir, subDir);

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const sanitizedFileName = sanitize(file.originalname); // Use sanitize here
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extname(sanitizedFileName)}`;
    const filePath = join(uploadDir, uniqueFileName);

    try {
      const metadata = await sharp(file.buffer).metadata();
      if (!metadata || !['jpeg', 'png', 'webp', 'gif'].includes(metadata.format)) {
        throw new BadRequestException('Invalid image format');
      }

      await sharp(file.buffer).resize(800, 800).toFile(filePath);

      return `/${subDir}/${uniqueFileName}`;
    } catch (error) {
      throw new BadRequestException('File is not a valid image or failed to process');
    }
  }

    deletePhoto(photoPath: string): void {
    // Normalize and resolve the full path
    const normalizedPhotoPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
    const fullPath = resolve(join('src','./uploads', normalizedPhotoPath));
  
    // Check and delete the file
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
      console.log(`File deleted successfully: ${fullPath}`);
    } else {
      console.error(`File not found: ${fullPath}`);
      throw new NotFoundException('Photo not found');
    }
  }

}
