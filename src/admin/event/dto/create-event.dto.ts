import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  title: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  description_ar?: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  address: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  locationUrl?: string;

  @ApiProperty({ type: Number, required: true })
  @Type(() => Number)
  @IsInt()
  cityId: number;
}