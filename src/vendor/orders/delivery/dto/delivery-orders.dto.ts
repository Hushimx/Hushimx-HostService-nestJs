import { IsOptional, IsInt, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {  DeliveryOrderStatus } from '@prisma/client';
import { PaginationAndSortingDto } from 'src/dto/pagination.dto';


export class QueryOrdersDto extends PaginationAndSortingDto {
    @ApiProperty({ description: 'Filter by order ID', example: 1, required: false })
    @IsOptional()
    @IsInt()
    id?: number;
  
    @ApiProperty({ description: 'Filter by store ID', required: false, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    storeId?: number;

  
    @ApiProperty({ description: 'Filter by the status', example: '1234567890', required: false })
    @IsOptional()
    @IsEnum(DeliveryOrderStatus)
    status?: string;


  
    @ApiProperty({ description: 'Filter by client phone number', example: '1234567890', required: false })
    @IsOptional()
    @IsString()
    clientNumber?: string;
  

}