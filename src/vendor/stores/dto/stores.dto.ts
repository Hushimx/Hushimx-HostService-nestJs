import { IsString, IsOptional, IsInt, IsUUID, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationAndSortingDto } from 'src/dto/pagination.dto';

export class CreateStoreDto {
  @ApiProperty({ description: 'Name of the store', example: 'ElectroMart' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Address of the vendor', example: '123 Vendor Street' })
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



}

export class UpdateStoreDto {
    @ApiProperty({ description: 'Name of the store', example: 'ElectroMart' })
    @IsOptional()
    @IsString()
    name?: string;
  
    @ApiPropertyOptional({ description: 'Address of the Stroe', example: '123 Store Street' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ description: 'Location URL of the vendor', example: 'https://maps.example.com/location/123' })
    @IsOptional()
    @IsUrl()
    locationUrl?: string;

    @ApiPropertyOptional({ description: 'Description of the store', example: 'Your one-stop shop for electronics' })
    @IsOptional()
    @IsString()
    description?: string;
  

}

export class QueryStoreDto extends PaginationAndSortingDto {
  @ApiPropertyOptional({ description: 'Filter by store name', example: 'ElectroMart' })
  @IsOptional()
  @IsString()
  name?: string;



}
