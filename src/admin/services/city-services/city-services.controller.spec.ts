import { Test, TestingModule } from '@nestjs/testing';
import { CityServicesController } from './city-services.controller';

describe('CityServicesController', () => {
  let controller: CityServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityServicesController],
    }).compile();

    controller = module.get<CityServicesController>(CityServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
