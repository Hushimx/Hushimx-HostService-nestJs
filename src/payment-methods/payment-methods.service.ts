import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
// import { PaymentMethodDto } from './payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async findAll(){
    const methods = await this.prisma.paymentMethod.findMany({
      where: {
        isActive: true,
      },
    });

    return methods.map(m => ({
      name: m.name,
      displayName: m.displayName,
      type: m.type,
      isActive: m.isActive,
      config: m.config ?? {},
    }));
  }
}
