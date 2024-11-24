import { Test, TestingModule } from '@nestjs/testing';
import { CityServicesService } from './city-services.service';

describe('CityServicesService', () => {
  let service: CityServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CityServicesService],
    }).compile();

    service = module.get<CityServicesService>(CityServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
