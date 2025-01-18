// src/hotels/dto/query-hotels.dto.ts
import { IsOptional, IsString,IsNotEmpty, IsEnum, IsInt, Min } from 'class-validator';
import { Transform,Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationAndSortingDto } from '../../dto/pagination.dto';

export class QueryHotelsDto extends PaginationAndSortingDto {
  @ApiProperty({ description: 'Filter by hotel name', required: false, example: 'Hotel Paradise' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Filter by city name', required: false, example: 'Jeddah' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  city?: string;

  @ApiProperty({ description: 'Filter by country ID', required: false, example: '1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  country?: string;

}
export class CreateHotelDto {
  @ApiProperty({ description: 'Name of the hotel', example: 'Grand Hotel' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Name of the hotel', example: 'Grand Hotel' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'Name of the hotel', example: 'Grand Hotel' })
  @IsOptional()
  @IsString()
  locationUrl: string;

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

  @ApiProperty({ description: 'The address of the hotel', example: '123 Main Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'the Location of the hotel', example: 'https://maps.app.goo.gl/iUtG5umypgaqxdVK6' })
  @IsOptional()
  @IsString()
  locationUrl?: string;



}

