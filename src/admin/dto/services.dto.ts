import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryServiceDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort field', example: 'name' })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class CreateServiceDto {
  @ApiProperty({ description: 'Name of the service', example: 'Cleaning' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique slug for the service', example: 'cleaning' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Service description', example: 'General cleaning services' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ description: 'Updated name of the service', example: 'Updated Cleaning' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Updated description of the service', example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ManageCityVendorDto {
  @ApiProperty({ description: 'City ID to associate', example: 1 })
  @IsNotEmpty()
  @IsInt()
  cityId: number;

  @ApiProperty({ description: 'Vendor ID to associate', example: 1 })
  @IsNotEmpty()
  @IsInt()
  vendorId: number;
}
