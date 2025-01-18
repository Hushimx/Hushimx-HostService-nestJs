import { ApiProperty } from '@nestjs/swagger';
import {  IsOptional,  IsInt } from 'class-validator';
import { Type } from 'class-transformer'
import { PaginationAndSortingDto } from 'src/dto/pagination.dto';



export class QueryCityServiceDto extends PaginationAndSortingDto  {


  @ApiProperty({ description: 'Filter by Service ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceId?: number;



}
