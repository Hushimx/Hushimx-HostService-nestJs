import { IsNotEmpty, IsString, IsInt,Min, IsUUID,IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationAndSortingDto } from './pagination.dto';


export class QueryRoomsDto extends PaginationAndSortingDto {
  @ApiPropertyOptional({ description: 'Room number to filter by', example: '101' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'Room type to filter by', example: 'Deluxe' })
  @IsOptional()
  @IsString()
  type?: string;

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
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiProperty({ description: 'Room type', example: 'Deluxe', required: false })
  @IsOptional()
  @IsString()
  type?: string;
}
