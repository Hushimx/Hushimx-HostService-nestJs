import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateServiceDto {
    @ApiProperty({ description: 'Name of the service', example: 'Cleaning' })
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @ApiProperty({ description: 'Unique slug for the service', example: 'cleaning' })
    @IsNotEmpty()
    @IsString()
    slug: string;
  
    @ApiPropertyOptional({ description: 'Service description', example: 'General cleaning services' })
    @IsOptional()
    @IsString()
    description?: string;
  }

