import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Express } from 'express';

@Injectable()
export class UploadService {
  private readonly baseUploadPath = join(__dirname, '..', 'uploads');

  constructor() {
    this.ensureBaseUploadPath();
  }

  // Ensure the base `uploads` directory exists
  private async ensureBaseUploadPath() {
    try {
      await fs.access(this.baseUploadPath);
    } catch {
      await fs.mkdir(this.baseUploadPath, { recursive: true });
    }
  }

  // Ensure a specific subfolder exists inside `uploads`
  private async ensureSubfolder(subfolder: string) {
    const folderPath = join(this.baseUploadPath, subfolder);
    try {
      await fs.access(folderPath);
    } catch {
      await fs.mkdir(folderPath, { recursive: true });
    }
  }

  // Generate a unique filename for each uploaded file
  private generateFilename(originalName: string): string {
    const uniqueId = uuidv4();
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    return `${uniqueId}${extension}`;
  }

  // Save the file securely in a chosen subfolder
  async saveFile(file: Express.Multer.File, subfolder: string): Promise<{ filename: string; path: string }> {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      throw new HttpException('Invalid file type. Only images are allowed.', HttpStatus.BAD_REQUEST);
    }

    const filename = this.generateFilename(file.originalname);
    await this.ensureSubfolder(subfolder);

    const filePath = join(this.baseUploadPath, subfolder, filename);

    try {
      await fs.writeFile(filePath, file.buffer);
    } catch (error) {
      throw new HttpException('Failed to save file', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { filename, path: `${subfolder}/${filename}` };
  }

  // Validate and retrieve the path of a stored file
  async getFilePath(subfolder: string, filename: string): Promise<string> {
    const filePath = join(this.baseUploadPath, subfolder, filename);

    try {
      await fs.access(filePath);
    } catch {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    return filePath;
  }
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = join(this.baseUploadPath, filePath);
    console.log(fullPath)
    try {
      await fs.access(fullPath); // Check if the file exists
      await fs.unlink(fullPath); // Delete the file
    } catch (error) {
      throw new HttpException('Failed to delete file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}


