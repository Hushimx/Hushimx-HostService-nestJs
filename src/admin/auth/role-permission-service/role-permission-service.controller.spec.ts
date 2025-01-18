import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionServiceController } from './role-permission-service.controller';

describe('RolePermissionServiceController', () => {
  let controller: RolePermissionServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolePermissionServiceController],
    }).compile();

    controller = module.get<RolePermissionServiceController>(RolePermissionServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
