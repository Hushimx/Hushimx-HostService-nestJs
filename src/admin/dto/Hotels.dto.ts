// src/hotels/dto/query-hotels.dto.ts
import { IsOptional, IsString,IsNotEmpty, IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryHotelsDto {
  @ApiProperty({ description: 'Filter by hotel name', required: false, example: 'Hotel Paradise' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Filter by city name', required: false, example: 'Jeddah' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Filter by country name', required: false, example: 'Saudi Arabia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Sort field', required: false, example: 'name' })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiProperty({ description: 'Sort order (asc or desc)', required: false, example: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Sort order must be "asc" or "desc"' })
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ description: 'Number of items per page', required: false, example: 10 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({ description: 'Pagination offset', required: false, example: 0 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  page?: number;
}
export class CreateHotelDto {
  @ApiProperty({ description: 'Name of the hotel', example: 'Grand Hotel' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'City ID of the hotel', example: 1 })
  @IsNotEmpty()
  @IsInt()
  cityId: number;


}

export class EditHotelDto {
  @ApiProperty({ description: 'Name of the hotel', required: false, example: 'Grand Hotel' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'City ID of the hotel', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  cityId?: number;


}

