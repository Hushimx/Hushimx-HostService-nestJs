import {  IsOptional, IsEnum, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateServiceOrderDto {
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
  