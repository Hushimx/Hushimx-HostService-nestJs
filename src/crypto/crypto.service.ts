import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class CryptoService {
  private readonly key: string;

  constructor(private configService: ConfigService) {
    this.key = this.configService.get<string>('ENCRYPTION_SECRET');
    if (!this.key) {
      throw new Error(
        'ENCRYPTION_SECRET is not defined in environment variables',
      );
    }
  }

  // Encrypt data using AES
  encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.key);
      return encrypted.toString();
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error('Decryption resulted in an empty string');
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}
