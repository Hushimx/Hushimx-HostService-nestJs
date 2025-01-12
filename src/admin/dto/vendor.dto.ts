import { IsNotEmpty, IsInt, IsOptional, IsString,IsEmail,IsUrl   } from 'class-validator';
import { Type } from 'class-transformer';

import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationAndSortingDto } from './pagination.dto';

export class QueryVendorDto extends PaginationAndSortingDto {
  @ApiProperty({ description: 'Filter by city Id', required: false, example: '1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  city?: string;

  @ApiProperty({ description: 'Filter by country Id', required: false, example: '1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  country?: string;
  @ApiProperty({ description: 'Phone number', example: '596000912' })
  @IsOptional()
  @IsString()
  phoneNo?: string;
  @ApiProperty({ description: 'Filter by vendor name', required: false, example: 'Vendor A' })
  @IsOptional()
  @IsString()
  name?:string;

  @ApiProperty({ description: 'Filter by vendor email', required: false, example: 'vendor@example.com' })
  @IsOptional()
  @IsString()
  email?: string;


}

export class CreateVendorDto {
  @ApiProperty({ description: 'Name of the vendor', example: 'Vendor A' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Phone number of the vendor', example: '596000912' })
  @IsNotEmpty()
  @IsString()
  phoneNo: string;

  @ApiProperty({ description: 'City ID where the vendor is located', example: 1 })
  @IsNotEmpty()
  @IsInt()
  cityId: number;

  @ApiPropertyOptional({ description: 'Address of the vendor', example: '123 Vendor Street' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: 'Email of the vendor', example: 'vendor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the admin', example: 'securepassword' })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: 'Location URL of the vendor', example: 'https://maps.example.com/location/123' })
  @IsOptional()
  @IsUrl()
  locationUrl?: string;
}

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
  @ApiPropertyOptional({ description: 'Updated name of the vendor', example: 'Updated Vendor A' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Updated phone number of the vendor', example: '596000913' })
  @IsOptional()
  @IsString()
  phoneNo?: string;



  @ApiPropertyOptional({ description: 'Updated city ID of the vendor', example: 2 })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @ApiPropertyOptional({ description: 'Updated address of the vendor', example: '456 New Vendor Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Updated email of the vendor', example: 'updated_vendor@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
 
  @ApiProperty({ description: 'Password for the admin', example: 'securepassword' })
  @IsOptional()
  password?: string;


  @ApiPropertyOptional({ description: 'Updated location URL of the vendor', example: 'https://maps.example.com/location/456' })
  @IsOptional()
  @IsUrl()
  locationUrl?: string;
}
