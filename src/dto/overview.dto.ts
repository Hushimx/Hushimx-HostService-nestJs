import {  IsOptional, } from 'class-validator';
import { Type } from 'class-transformer';


export class OverviewDto  {

    @Type(() => Number) // Ensures the value is transformed to a number
    @IsOptional()
    country?: number;
  }
  