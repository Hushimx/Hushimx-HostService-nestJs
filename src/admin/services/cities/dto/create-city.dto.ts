import { ApiProperty, PartialType,  } from '@nestjs/swagger';
import {  IsOptional, IsString, IsInt,IsNotEmpty } from 'class-validator';
import { PaginationAndSortingDto } from 'src/admin/dto/pagination.dto';
import { Sanitize } from 'src/admin/decorator/sanitize.decorator';



export class CreateCityServiceDto {
  @ApiProperty({ description: 'Description of the service-vendor association', example: 'Provides plumbing services in Riyadh' })
  @IsOptional()
  @Sanitize()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Arabic description of the service-vendor association', example: 'يقدم خدمات السباكة في الرياض' })
  @IsOptional()
  @Sanitize()
  @IsString()
  description_ar?: string;

  @ApiProperty({ description: 'ID of the vendor', example: 1 })
  @IsNotEmpty()
  @IsInt()
  vendorId: number;
  @ApiProperty({ description: 'Updated city ID for the vendor', example: 3 })
  @IsNotEmpty()
  @IsInt()
  serviceId?: number;
  @ApiProperty({ description: 'ID of the city', example: 2 })
  @IsNotEmpty()
  @IsInt()
  cityId: number;
}