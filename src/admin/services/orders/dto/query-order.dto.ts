import {IsOptional, IsEnum,  IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { PaginationAndSortingDto } from 'src/admin/dto/pagination.dto';



export class QueryServiceOrdersDto extends PaginationAndSortingDto {


    @ApiProperty({ description: 'Filter by status', example: 'PENDING', required: false })
    @IsOptional()
    @IsEnum(ServiceOrderStatus)
    status?: ServiceOrderStatus;
  
    @ApiProperty({ description: 'Filter by client ID', example: 1, required: false })
    @IsOptional()
    @IsInt()
    clientId?: number;
  
    @ApiProperty({ description: 'Filter by service ID', example: 1, required: false })
    @IsOptional()
    @IsInt()
    serviceId?: number;
  
    @ApiProperty({ description: 'Filter by vendor ID', example: 1, required: false })
    @IsOptional()
    @IsInt()
    vendorId?: number;
  
    @ApiProperty({ description: 'Filter by city ID', example: 1, required: false })
    @Type(() => Number)
    @IsOptional()
    city?: number;
  
    @ApiProperty({ description: 'Filter by country ID', example: "1", required: false })
    @IsOptional()
    @Type(() => Number)
    country?: number;
  }
  