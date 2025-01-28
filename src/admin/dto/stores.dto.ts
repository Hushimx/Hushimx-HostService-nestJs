import { IsString, IsOptional, IsInt, IsUUID, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationAndSortingDto } from '../../dto/pagination.dto';

export class CreateStoreDto {
  @ApiProperty({ description: 'Name of the store', example: 'ElectroMart' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Address of the vendor', example: '123 Vendor Street' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: 'Location URL of the vendor', example: 'https://maps.example.com/location/123' })
  @IsOptional()
  @IsUrl()
  locationUrl?: string;

  @ApiPropertyOptional({ description: 'Description of the store', example: 'Your one-stop shop for electronics' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Section ID of the store', example: 2 })
  @Type(() => Number)
  @IsInt()
  sectionId?: number;

  @ApiProperty({ description: 'City ID where the store is located', example: 101 })
  @Type(() => Number)
  @IsInt()
  cityId: number;

  @ApiProperty({ description: 'Vendor ID managing the store', example: 42 })
  @Type(() => Number)
  @IsInt()
  vendorId: number;

}

export class UpdateStoreDto {
    @ApiProperty({ description: 'Name of the store', example: 'ElectroMart' })
    @IsOptional()
    @IsString()
    name?: string;
  
    @ApiPropertyOptional({ description: 'Description of the store', example: 'Your one-stop shop for electronics' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Address of the Stroe', example: '123 Store Street' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ description: 'Location URL of the vendor', example: 'https://maps.example.com/location/123' })
    @IsOptional()
    @IsUrl()
    locationUrl?: string;
  
    @ApiPropertyOptional({ description: 'Section ID of the store', example: 2 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    sectionId?: number;
  
    @ApiProperty({ description: 'City ID where the store is located', example: 101 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    cityId?: number;
  
    @ApiProperty({ description: 'Vendor ID managing the store', example: 42 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    vendorId?: number;
}

export class QueryStoreDto extends PaginationAndSortingDto {
  @ApiPropertyOptional({ description: 'Filter by store name', example: 'ElectroMart' })
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

  @ApiPropertyOptional({ description: 'Section ID of the store', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sectionId?: number;


}
