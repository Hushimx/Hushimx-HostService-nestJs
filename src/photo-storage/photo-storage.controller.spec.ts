import { Test, TestingModule } from '@nestjs/testing';
import { PhotoStorageController } from './photo-storage.controller';

describe('PhotoStorageController', () => {
  let controller: PhotoStorageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotoStorageController],
    }).compile();

    controller = module.get<PhotoStorageController>(PhotoStorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
