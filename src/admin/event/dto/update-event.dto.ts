import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  description_ar?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  locationUrl?: string;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cityId?: number;
}