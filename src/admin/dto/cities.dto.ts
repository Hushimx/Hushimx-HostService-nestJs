import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationAndSortingDto } from './pagination.dto';

export class FindAllCitiesDto extends PaginationAndSortingDto {
  @ApiPropertyOptional({
    description: 'Filter by country id',
    example: 'US',
  })
  @IsOptional()
  @IsInt()
  country?: string;

@ApiPropertyOptional({
    description: 'Filter by city name',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  name?: string;

}
