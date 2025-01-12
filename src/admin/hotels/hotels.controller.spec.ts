import { Test, TestingModule } from '@nestjs/testing';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { CreateHotelDto, EditHotelDto, QueryHotelsDto } from '../dto/Hotels.dto';

describe('HotelsController', () => {
  let controller: HotelsController;
  let service: HotelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelsController],
      providers: [
        {
          provide: HotelsService,
          useValue: {
            getHotels: jest.fn(),
            createHotel: jest.fn(),
            editHotel: jest.fn(),
            deleteHotel: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HotelsController>(HotelsController);
    service = module.get<HotelsService>(HotelsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHotels', () => {
    it('should call HotelsService.getHotels with correct parameters', async () => {
      const query: QueryHotelsDto = { page: 1, limit: 10, name: 'Test Hotel' };
      const user = { role: 'REGIONAL_ADMIN', countryId: 1 };

      await controller.getHotels(query, user);

      expect(service.getHotels).toHaveBeenCalledWith(query, user.role, user.countryId);
    });
  });

  describe('createHotel', () => {
    it('should call HotelsService.createHotel with correct parameters', async () => {
      const dto: CreateHotelDto = { name: 'Test Hotel', cityId: 1 };
      const user = { role: 'REGIONAL_ADMIN', countryId: 1 };

      await controller.createHotel(dto, user);

      expect(service.createHotel).toHaveBeenCalledWith(dto, user.role, user.countryId);
    });
  });

  describe('editHotel', () => {
    it('should call HotelsService.editHotel with correct parameters', async () => {
      const hotelId = 1;
      const dto: EditHotelDto = { name: 'Updated Hotel Name' };
      const user = { role: 'REGIONAL_ADMIN', countryId: 1 };

      await controller.editHotel(hotelId, dto, user);

      expect(service.editHotel).toHaveBeenCalledWith(hotelId, dto, user.role, user.countryId);
    });
  });

  describe('deleteHotel', () => {
    it('should call HotelsService.deleteHotel with correct parameters', async () => {
      const hotelId = 1;
      const user = { role: 'REGIONAL_ADMIN', countryId: 1 };

      await controller.deleteHotel(hotelId, user);

      expect(service.deleteHotel).toHaveBeenCalledWith(hotelId, user.role, user.countryId);
    });
  });
});
