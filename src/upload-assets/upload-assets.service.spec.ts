import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload-assets.service';
import { promises as fs } from 'fs';
import { join } from 'path';

describe('UploadService', () => {
  let service: UploadService;
  const mockFile = {
    originalname: 'test-image.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
  } as Express.Multer.File;

  const subfolder = 'test';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterAll(async () => {
    // Cleanup: Remove the test directory and files
    const testFolderPath = join(__dirname, '..', '..', 'uploads', subfolder);
    await fs.rm(testFolderPath, { recursive: true, force: true });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create the base upload directory if it does not exist', async () => {
    const basePath = join(__dirname, '..', '..', 'uploads');
    const exists = await fs
      .access(basePath)
      .then(() => true)
      .catch(() => false);

    expect(exists).toBe(true);
  });

  it('should save an image file in the specified subfolder', async () => {
    const result = await service.saveFile(mockFile, subfolder);

    expect(result.filename).toMatch(/^[a-f0-9-]{36}\.jpg$/); // UUID + extension
    expect(result.path).toContain(subfolder);

    const fileExists = await fs
      .access(result.path)
      .then(() => true)
      .catch(() => false);

    expect(fileExists).toBe(true);
  });

  it('should reject unsupported file types', async () => {
    const invalidFile = {
      ...mockFile,
      mimetype: 'text/plain',
    } as Express.Multer.File;

    await expect(service.saveFile(invalidFile, subfolder)).rejects.toThrow(
      'Invalid file type. Only images are allowed.',
    );
  });

  it('should throw an error if the file does not exist', async () => {
    await expect(service.getFilePath(subfolder, 'non-existent.jpg')).rejects.toThrow(
      'File not found',
    );
  });

  it('should retrieve the path of an existing file', async () => {
    const savedFile = await service.saveFile(mockFile, subfolder);
    const retrievedPath = await service.getFilePath(subfolder, savedFile.filename);

    expect(retrievedPath).toBe(savedFile.path);
  });
});
