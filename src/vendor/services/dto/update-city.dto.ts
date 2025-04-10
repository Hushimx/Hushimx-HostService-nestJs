import { ApiProperty, PartialType } from '@nestjs/swagger';
import {  IsOptional, IsString, IsInt,IsNotEmpty } from 'class-validator';
import { PaginationAndSortingDto } from 'src/dto/pagination.dto';
import { Sanitize } from 'src/decorator/sanitize.decorator';

export class UpdateCityServiceDto {
  @ApiProperty({ description: 'Updated description of the service-vendor association', example: 'Updated plumbing services' })
  @IsOptional()
  @Sanitize()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Updated Arabic description of the service-vendor association', example: 'تحديث خدمات السباكة' })
  @IsOptional()
  @Sanitize()
  @IsString()
  description_ar?: string;
  
  @ApiProperty({ description: 'address of the service-vendor ', example: 'يقدم خدمات السباكة في الرياض' })
  @IsOptional()
  @IsString()
  address: string;
  
  @ApiProperty({ description: 'location of the service-vendor ', example: 'يقدم خدمات السباكة في الرياض' })
  @IsOptional()
  @IsString()
  locationUrl: string;
  

}


