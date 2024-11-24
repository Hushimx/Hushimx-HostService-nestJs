import { IsNotEmpty, IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryVendorDto {
  @ApiPropertyOptional({ description: 'Filter by country ID (for Super Admin only)', example: 1 })
  @IsOptional()
  @IsInt()
  countryId?: number; // Optional country filter for Super Admin

  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'name' })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({ description: 'Sorting order', example: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class CreateVendorDto {
  @ApiProperty({ description: 'Name of the vendor', example: 'Vendor A' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'City ID where the vendor is located', example: 1 })
  @IsNotEmpty()
  @IsInt()
  cityId: number;
}

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
  @ApiPropertyOptional({ description: 'Name of the vendor', example: 'Updated Vendor A' })
  name?: string;

  @ApiPropertyOptional({ description: 'City ID where the vendor is located', example: 2 })
  cityId?: number;
}
