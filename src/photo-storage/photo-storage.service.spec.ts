import { Test, TestingModule } from '@nestjs/testing';
import { PhotoStorageService } from './photo-storage.service';

describe('PhotoStorageService', () => {
  let service: PhotoStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotoStorageService],
    }).compile();

    service = module.get<PhotoStorageService>(PhotoStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
