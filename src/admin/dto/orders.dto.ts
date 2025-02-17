import { IsOptional, IsInt, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {  DeliveryOrderStatus } from '@prisma/client';
import { PaginationAndSortingDto } from '../../dto/pagination.dto';

export class QueryOrdersDto extends PaginationAndSortingDto {
  @ApiProperty({ description: 'Filter by order ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  id?: number;
  
  @ApiProperty({ description: 'Filter by the status', example: 'ON_WAY', required: false })
  @IsOptional()
  @IsEnum(DeliveryOrderStatus)
  status?: string;

  @ApiProperty({ description: 'Filter by country ID', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  country?: number;
  @ApiProperty({ description: 'Filter by city ID', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  city: number

  @ApiProperty({ description: 'Filter by room id', example: 1, required: false })
  @IsOptional()
  @IsInt()
  roomId?: number;

  @ApiProperty({ description: 'Filter by room Number', example: '101', required: false })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiProperty({ description: 'Filter by hotel Name', example: 'Hotel ABC', required: false })
  @IsOptional()
  @IsString()
  hotelName?: string;

  @ApiProperty({ description: 'Filter by hotel ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  hotelId?: number;

  @ApiProperty({ description: 'Filter by city ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  cityId?: number;

  // Added Properties
  @ApiProperty({ description: 'Filter by client ID', example: 123, required: false })
  @IsOptional()
  @IsInt()
  clientId?: number;

  @ApiProperty({ description: 'Filter by client phone number', example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  clientNumber?: string;

  @ApiProperty({ description: 'Filter by store section', example: 'Electronics', required: false })
  @IsOptional()
  @IsString()
  storeSection?: string;
}

export class EditOrderDto {
  @ApiProperty({ description: 'Order status', example: 'COMPLETED', required: false })
  @IsOptional()
  @IsEnum(DeliveryOrderStatus)
  status?: DeliveryOrderStatus;

  @ApiProperty({ description: 'Driver ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  driverId: number;
  @ApiProperty({ description: 'Notes for the order', example: 'Updated delivery time', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
