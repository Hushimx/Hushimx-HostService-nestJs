import { Global, Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
@Global() // Make the module global
@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
