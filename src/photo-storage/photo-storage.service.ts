import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { createReadStream, existsSync, mkdirSync, unlinkSync } from 'fs';
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

  getPhotoStream(photoPath: string): { stream: NodeJS.ReadableStream; mimeType: string } {
    // Normalize and sanitize the path to prevent path traversal attacks
    const sanitizedPath = normalize(photoPath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = resolve(this.baseUploadDir, sanitizedPath);

    // Ensure the requested file is within the allowed base directory
    if (!fullPath.startsWith(resolve(this.baseUploadDir))) {
      throw new ForbiddenException('Access denied');
    }

    // Check if the file exists
    if (!existsSync(fullPath)) {
      throw new NotFoundException('Photo not found');
    }

    const mimeType = this.getMimeType(fullPath);

    return {
      stream: createReadStream(fullPath),
      mimeType,
    };
  }

  private getMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        throw new NotFoundException('Unsupported file format');
    }
  }

  async savePhoto(file: Express.Multer.File, subDir: string): Promise<string> {
    const uploadDir = join(this.baseUploadDir, subDir);

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
    const fullPath = resolve(join('./uploads', normalizedPhotoPath));
  
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
