import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  Min,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationAndSortingDto } from '../../dto/pagination.dto'; // Ensure you import this if using it

// -----------------------------------------------
// QueryProductDto: For filtering and pagination
// -----------------------------------------------
export class QueryProductDto extends PaginationAndSortingDto {
  @ApiPropertyOptional({ description: 'Filter by product name', example: 'Laptop' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by country Id', example: '2' })
  @IsOptional()
  @Type(() => Number)
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by city ID', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Convert input to an integer
  @IsInt({ message: 'cityId must be an integer' })
  cityId?: number;

  @ApiPropertyOptional({ description: 'Filter by approved status', example: true })
  @IsOptional()
  @IsBoolean()
  aproved?: boolean

  @ApiPropertyOptional({ description: 'Filter by category ID', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Convert input to an integer
  @IsInt({ message: 'categoryId must be an integer' })
  categoryId?: number;
  



}
// -----------------------------------------------
// CreateProductDto: For creating a new product
// -----------------------------------------------
export class CreateProductDto {
  @ApiProperty({ description: 'Name of the product', example: 'Product A' })
  @IsNotEmpty({ message: 'name is required' })
  @IsString({ message: 'name must be a string' })
  name: string;

  @ApiProperty({ description: 'Price of the product', example: 100.5 })
  @IsNotEmpty({ message: 'price is required' })
  @Transform(({ value }) => parseFloat(value)) // Convert input to a float
  @IsNumber({}, { message: 'price must be a number' })
  @Min(0, { message: 'price must not be less than 0' })
  price: number;

  @ApiPropertyOptional({ description: 'Category ID associated with the product', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Convert input to an integer
  @IsInt({ message: 'categoryId must be an integer' })
  categoryId?: number;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Product image',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File; // For file uploads
}

// -----------------------------------------------
// UpdateProductDto: For updating an existing product
// -----------------------------------------------
export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Updated product name', example: 'Updated Product A' })
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  @ApiPropertyOptional({ description: 'Updated product price', example: 150.0 })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value)) // Convert input to a float
  @IsNumber({}, { message: 'price must be a number' })
  @Min(0, { message: 'price must not be less than 0' })
  price?: number;


  @ApiPropertyOptional({ description: 'Updated category ID', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Convert input to an integer
  @IsInt({ message: 'categoryId must be an integer' })
  categoryId?: number;


  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Updated product image',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File; // For file uploads
}
