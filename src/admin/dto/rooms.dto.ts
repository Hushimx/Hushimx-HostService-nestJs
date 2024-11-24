import { IsNotEmpty, IsString, IsInt,Min, IsUUID,IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class QueryRoomsDto {
  @ApiPropertyOptional({ description: 'Room number to filter by', example: '101' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'Room type to filter by', example: 'Deluxe' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Number of items to skip', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({ description: 'Sort order (asc or desc)', example: 'asc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}


export class CreateRoomDto {
  @ApiProperty({ description: 'Room number', example: '101' })
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  @ApiProperty({ description: 'Room type', example: 'Deluxe' })
  @IsOptional()
  @IsString()
  type?: string;


}

export class EditRoomDto {
  @ApiProperty({ description: 'Room number', example: '101', required: false })
  @IsString()
  roomNumber?: string;

  @ApiProperty({ description: 'Room type', example: 'Deluxe', required: false })
  @IsString()
  type?: string;
}
