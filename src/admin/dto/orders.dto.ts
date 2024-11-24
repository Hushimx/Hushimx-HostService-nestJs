import { IsOptional, IsInt, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderStatus } from '@prisma/client';

export class QueryOrdersDto {
  @ApiProperty({ description: 'Page limit', example: 10, required: false })
  @IsOptional()
  @IsInt()
  limit?: number;

  @ApiProperty({ description: 'Page offset', example: 0, required: false })
  @IsOptional()
  @IsInt()
  offset?: number;

  @ApiProperty({ description: 'Sort field (e.g., createdAt)', example: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiProperty({ description: 'Sort order (asc or desc)', example: 'asc', required: false })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ description: 'Filter by order ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ description: 'Filter by room ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  roomId?: number;

  @ApiProperty({ description: 'Filter by hotel ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  hotelId?: number;

  @ApiProperty({ description: 'Filter by city ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  cityId?: number;
}


export class EditOrderDto {
  @ApiProperty({ description: 'Order status', example: 'COMPLETED', required: false })
  @IsOptional()
  @IsEnum(['PENDING','SHIPPED', 'DELIVERED', 'CANCELED'])
  status?: OrderStatus;

  @ApiProperty({ description: 'Notes for the order', example: 'Updated delivery time', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
