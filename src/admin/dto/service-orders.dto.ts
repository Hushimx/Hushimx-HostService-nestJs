import { IsNotEmpty, IsOptional, IsEnum, IsString, IsInt, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@prisma/client';
import { PaginationAndSortingDto } from './pagination.dto';
import { Type } from 'class-transformer';

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



export class EditServiceOrderDto {
  @ApiProperty({ description: 'Service order status', example: 'COMPLETED', required: false })
  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  status?: ServiceOrderStatus;
  
  @ApiProperty({ description: 'Driver\'s ID', example: '1', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  driverId?: number;

  @ApiProperty({ description: 'Order notes', example: 'Update delivery time', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
