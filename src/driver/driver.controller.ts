import { Controller, Patch, Query, Body, NotFoundException, Get } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DeliveryOrderStatus, ServiceOrderStatus } from '@prisma/client';

@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get("d")
  async test() {
    return 11;
  }
  // Endpoint to validate driver code and fetch the associated order
  @Get('validate')
  async validateDriverCode(
    @Query('type') type: 'SERVICE_ORDER' | 'DELIVERY_ORDER',
    @Query('code') code: string,
  ) {
    if (!type || !code) {
      throw new NotFoundException('Type and driver code are required.');
    }

    return this.driverService.validateDriverCode(type, code);
  }

  // Endpoint to update the order
  @Patch('update')
  async updateOrder(
    @Query('type') type: 'SERVICE_ORDER' | 'DELIVERY_ORDER',
    @Query('code') driverCode: string,
    @Body() updateData: { status: DeliveryOrderStatus & ServiceOrderStatus; notes?: string },
  ) {
    if (!type || !driverCode) {
      throw new NotFoundException('Type and driver code are required.');
    }
    return this.driverService.updateOrder(type, driverCode, updateData);
  }
}
