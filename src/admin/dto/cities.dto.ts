import { IsOptional, IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationAndSortingDto } from '../../dto/pagination.dto';

export class QueryCityDto extends PaginationAndSortingDto {


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


}

export class UpdateCityDto {
  @ApiPropertyOptional({ description: 'Name of the city', required: false })
  @IsString()
  @IsOptional()
  name?: string;


}
