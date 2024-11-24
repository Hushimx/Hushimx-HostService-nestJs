import { IsNotEmpty, IsOptional, IsInt, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryProductDto {
  @ApiPropertyOptional({ description: 'City ID to filter products', example: 1 })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @ApiPropertyOptional({ description: 'Vendor ID to filter products', example: 1 })
  @IsOptional()
  @IsInt()
  vendorId?: number;

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

export class CreateProductDto {
  @ApiProperty({ description: 'Name of the product', example: 'Product A' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Price of the product', example: 100.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Vendor ID associated with the product', example: 1 })
  @IsNotEmpty()
  @IsInt()
  vendorId: number;

  @ApiProperty({ description: 'City ID associated with the product', example: 1 })
  @IsNotEmpty()
  @IsInt()
  cityId: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Updated product name', example: 'Updated Product A' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Updated product price', example: 150.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'Vendor ID associated with the product (required)', example: 1 })
  @IsNotEmpty()
  @IsInt()
  vendorId: number;

  @ApiPropertyOptional({ description: 'City ID associated with the product (optional)', example: 1 })
  @IsOptional()
  @IsInt()
  cityId?: number;
}
