import { IsString, IsOptional, IsInt, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationAndSortingDto } from 'src/dto/pagination.dto';

export class CreateStoreDto {
  @ApiProperty({ description: 'Name of the store', example: 'ElectroMart' })
  @IsString()
  name: string;

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
