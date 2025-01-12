// import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { Type } from 'class-transformer';
// import { PaginationAndSortingDto } from './pagination.dto';
// import { Sanitize } from '../decorator/sanitize.decorator';



// export class CreateCityServiceVendorDto {
//   @ApiProperty({ description: 'Description of the service-vendor association', example: 'Provides plumbing services in Riyadh' })
//   @IsOptional()
//   @Sanitize()
//   @IsString()
//   description?: string;

//   @ApiProperty({ description: 'Arabic description of the service-vendor association', example: 'يقدم خدمات السباكة في الرياض' })
//   @IsOptional()
//   @Sanitize()
//   @IsString()
//   description_ar?: string;

//   @ApiProperty({ description: 'ID of the vendor', example: 1 })
//   @IsNotEmpty()
//   @IsInt()
//   vendorId: number;
//   @ApiProperty({ description: 'Updated city ID for the vendor', example: 3 })
//   @IsNotEmpty()
//   @IsInt()
//   serviceId?: number;
//   @ApiProperty({ description: 'ID of the city', example: 2 })
//   @IsNotEmpty()
//   @IsInt()
//   cityId: number;
// }

// export class UpdateCityServiceVendorDto extends PaginationAndSortingDto {
//   @ApiProperty({ description: 'Updated description of the service-vendor association', example: 'Updated plumbing services' })
//   @IsOptional()
//   @Sanitize()
//   @IsString()
//   description?: string;

//   @ApiProperty({ description: 'Updated Arabic description of the service-vendor association', example: 'تحديث خدمات السباكة' })
//   @IsOptional()
//   @Sanitize()
//   @IsString()
//   description_ar?: string;

//   @ApiProperty({ description: 'Updated city ID for the vendor', example: 3 })
//   @IsOptional()
//   @IsInt()
//   serviceId?: number;

//   @ApiProperty({ description: 'ID of the vendor', example: 1 })
//   @IsOptional()
//   @IsInt()
//   vendorId: number;
  
//   @ApiProperty({ description: 'Updated city ID for the vendor', example: 3 })
//   @IsOptional()
//   @IsInt()
//   cityId?: number;
// }

// export class QueryCityServiceVendorDto extends PaginationAndSortingDto {
//   @ApiProperty({ description: 'Filter by vendor ID', example: 1 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   vendorId?: number;

//   @ApiProperty({ description: 'Filter by Service ID', example: 1 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   serviceId?: number;

//   @ApiProperty({ description: 'Filter by city ID', example: 2 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   city?: number;

//   @ApiProperty({ description: 'Filter by country ID', example: 1 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   country?:number


// }
