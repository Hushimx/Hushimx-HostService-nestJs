import { PaginationAndSortingDto } from "src/admin/dto/pagination.dto";
import {  IsOptional, IsString } from 'class-validator';
import {  ApiPropertyOptional } from '@nestjs/swagger';

export class QueryServiceDto extends PaginationAndSortingDto {
    @ApiPropertyOptional({ description: 'Service name to filter by', example: 'Cleaning' })
    @IsOptional()
    @IsString()
    name?: string;
  
    @ApiPropertyOptional({ description: 'Service slug to filter by', example: 'cleaning' })
    @IsOptional()
    @IsString()
    slug?: string;
  
    
  }