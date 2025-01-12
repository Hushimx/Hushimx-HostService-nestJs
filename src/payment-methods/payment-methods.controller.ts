import { Controller, Get } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payment Methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  @Get()
  async getPaymentMethods() {
    return this.paymentMethodsService.findAll();
  }
}
