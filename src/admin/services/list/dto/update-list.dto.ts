import {  IsOptional, IsString,IsNotEmpty  } from 'class-validator';
import {  ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiceDto {
    @ApiPropertyOptional({ description: 'Updated name of the service', example: 'Updated Cleaning' })
    @IsOptional()
    @IsString()
    name?: string;
  
    @ApiProperty({ description: 'Name of the service in arabic', example: 'غسيل الغرف' })
    @IsNotEmpty()
    @IsString()
    name_ar: string;

    @ApiPropertyOptional({ description: 'Updated description of the service', example: 'Updated description' })
    @IsOptional()
    @IsString()
    description?: string;
  }
  