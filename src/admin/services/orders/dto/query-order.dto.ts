import { IsOptional, IsEnum, IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { PaginationAndSortingDto } from 'src/dto/pagination.dto';
import { isString } from 'util';



export class QueryServiceOrdersDto extends PaginationAndSortingDto {
  @ApiProperty({ description: 'Filter by status', example: 'PENDING', required: false })
  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  status?: ServiceOrderStatus;

  @ApiProperty({ description: 'Filter by client name', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({ description: 'Filter by client number', example: '12345', required: false })
  @IsOptional()
  @IsString()
  clientNumber?: string;

  @ApiProperty({ description: 'Filter by hotel name', example: 'Hotel California', required: false })
  @IsOptional()
  @IsString()
  hotelName?: string;

  @ApiProperty({ description: 'Filter by room number', example: '101', required: false })
  @IsOptional()
  @IsString()
  roomNumber?: string;

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

  