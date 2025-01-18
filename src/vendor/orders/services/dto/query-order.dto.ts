import { IsOptional, IsEnum, IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { PaginationAndSortingDto } from 'src/dto/pagination.dto';



export class QueryServiceOrdersDto extends PaginationAndSortingDto {


    @ApiProperty({ description: 'Filter by status', example: 'PENDING', required: false })
    @IsOptional()
    @IsEnum(ServiceOrderStatus)
    status?: ServiceOrderStatus;
  
    @ApiProperty({ description: 'Filter by client phone number', example: '1234567890', required: false })
    @IsOptional()
    @IsString()
    clientNumber?: string;

    @ApiProperty({ description: 'Filter by service ID', example: 1, required: false })
    @IsOptional()
    @IsInt()
    serviceId?: number;
  

  }
  