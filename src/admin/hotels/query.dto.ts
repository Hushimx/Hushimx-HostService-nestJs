// src/dto/query-common.dto.ts
import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryCommonDto {
  @ApiProperty({ description: 'Filter field values (e.g., name, cityId)', required: false, example: { name: 'Hotel' } })
  @IsOptional()
  filters?: { [key: string]: any };

  @ApiProperty({ description: 'Sort field', required: false, example: 'name' })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiProperty({ description: 'Sort order', required: false, example: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Sort order must be either "asc" or "desc"' })
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ description: 'Number of items per page', required: false, example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ description: 'Pagination offset', required: false, example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
