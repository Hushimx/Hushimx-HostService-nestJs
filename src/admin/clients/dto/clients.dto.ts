import { IsOptional, IsString, IsNotEmpty, IsInt, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Query } from '@nestjs/common';

export class CreateClientDto {
  @ApiProperty({ description: 'Name of the client', example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Phone number of the client', example: '+1234567890' })
  @IsPhoneNumber(null)
  @IsNotEmpty()
  phoneNo: string;

  @ApiProperty({ description: 'Country ID where the client belongs', example: 1 })
  @IsInt()
  @Type(() => Number)
  countryId: number;
}

export class UpdateClientDto {
  @ApiPropertyOptional({ description: 'Name of the client', required: false, example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Phone number of the client', required: false, example: '+1234567890' })
  @IsPhoneNumber(null)
  @IsOptional()
  phoneNo?: string;

  @ApiPropertyOptional({ description: 'Country ID to update the client\'s country', required: false, example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  countryId?: number;
}

export class QueryClientDto {
  @ApiPropertyOptional({ description: 'Filter by client name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by phone number', example: '+1234567890' })
  @IsPhoneNumber(null)
  @IsOptional()
  phoneNo?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Number of records per page', example: 10 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'createdAt' })
  @IsString()
  @IsOptional()
  sortField?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 'asc' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
