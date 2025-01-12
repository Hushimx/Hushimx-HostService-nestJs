import { IsOptional, IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationAndSortingDto } from './pagination.dto';

export class QueryCityDto extends PaginationAndSortingDto {
  @ApiPropertyOptional({
    description: 'Filter by country ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  country?: number;

  @ApiPropertyOptional({
    description: 'Filter by city name',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateCityDto {
  @ApiProperty({ description: 'Name of the city' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Country ID to which the city belongs' })
  @IsInt()
  @Type(() => Number)
  countryId: number;
}

export class UpdateCityDto {
  @ApiPropertyOptional({ description: 'Name of the city', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Country ID to which the city belongs', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  countryId?: number;
}
