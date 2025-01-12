import { ApiProperty } from '@nestjs/swagger';
import {  IsOptional,  IsInt } from 'class-validator';
import { Type } from 'class-transformer'
import { PaginationAndSortingDto } from 'src/admin/dto/pagination.dto';



export class QueryCityServiceDto extends PaginationAndSortingDto  {
  @ApiProperty({ description: 'Filter by vendor ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendorId?: number;

  @ApiProperty({ description: 'Filter by Service ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceId?: number;

  @ApiProperty({ description: 'Filter by city ID', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  city?: number;

  @ApiProperty({ description: 'Filter by country ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  country?:number


}
