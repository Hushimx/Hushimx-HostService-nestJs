import { IsNotEmpty, IsOptional, IsEnum, IsString, IsInt, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@prisma/client';

export class QueryServiceOrdersDto {
  @ApiProperty({ description: 'Page limit', example: 10, required: false })
  @IsOptional()
  @IsInt()
  limit?: number;

  @ApiProperty({ description: 'Page offset', example: 0, required: false })
  @IsOptional()
  @IsInt()
  offset?: number;

  @ApiProperty({ description: 'Sort field', example: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiProperty({ description: 'Sort order', example: 'asc', required: false })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

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
  @IsOptional()
  @IsInt()
  cityId?: number;

  @ApiProperty({ description: 'Filter by country ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  countryId?: number;
}

export class CreateServiceOrderDto {
  @ApiProperty({ description: 'Service ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  serviceId: number;

  @ApiProperty({ description: 'Vendor ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  vendorId: number;

  @ApiProperty({ description: 'Client ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  clientId: number;

  @ApiProperty({ description: 'Order notes', example: 'Deliver quickly', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Total amount', example: 150.0 })
  @IsNotEmpty()
  @IsNumber()
  total: number;
}

export class EditServiceOrderDto {
  @ApiProperty({ description: 'Service order status', example: 'COMPLETED', required: false })
  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  status?: ServiceOrderStatus;

  @ApiProperty({ description: 'Order notes', example: 'Update delivery time', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
