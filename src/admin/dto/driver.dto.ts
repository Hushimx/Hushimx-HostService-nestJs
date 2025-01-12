import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { PaginationAndSortingDto } from './pagination.dto';

// DTO for creating a driver
export class CreateDriverDto {
  @ApiProperty({ description: 'Name of the driver', example: 'Driver A' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Phone number of the driver', example: '596000912' })
  @IsNotEmpty()
  @IsString()
  phoneNo: string;

  @ApiProperty({ description: 'City ID of the driver', example: 1 })
  @IsNotEmpty()
  @IsInt()
  cityId: number;
}

// DTO for updating a driver
export class UpdateDriverDto  {
  @ApiProperty({ description: 'Name of the driver', example: 'Driver A' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Phone number of the driver', example: '596000912' })
  @IsOptional()
  @IsString()
  phoneNo?: string;

  @ApiProperty({ description: 'City ID of the driver', example: 1 })
  @IsOptional()
  @IsInt()
  cityId?: number;
}

// DTO for querying drivers with filters, pagination, and sorting
export class QueryDriverDto extends PaginationAndSortingDto {
  @ApiPropertyOptional({ description: 'Filter by driver name', example: 'Driver A' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by phone number', example: '596000912' })
  @IsOptional()
  @IsString()
  phoneNo?: string;

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
