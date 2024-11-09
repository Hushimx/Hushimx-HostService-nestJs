import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module';
import { CityModule } from './city/city.module';

@Module({
  imports: [CountryModule, CityModule],
})
export class AdminModule {}
