import {  IsOptional, IsString,  } from 'class-validator';
import {  ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiceDto {
    @ApiPropertyOptional({ description: 'Updated name of the service', example: 'Updated Cleaning' })
    @IsOptional()
    @IsString()
    name?: string;
  
    @ApiPropertyOptional({ description: 'Updated description of the service', example: 'Updated description' })
    @IsOptional()
    @IsString()
    description?: string;
  }
  