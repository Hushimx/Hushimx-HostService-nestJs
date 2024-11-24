import { IsEmail, IsNotEmpty, IsOptional,isString, IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ description: 'Email of the admin', example: 'admin@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the admin', example: 'securepassword' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'First name of the admin', example: 'John' })
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ description: 'Last name of the admin', example: 'Doe' })
  @IsNotEmpty()
  lastName: string
  
  @ApiProperty({ description: 'Role of the admin', enum: ['SUPER_ADMIN', 'REGIONAL_ADMIN'] })
  @IsNotEmpty()
  @IsEnum(['SUPER_ADMIN', 'REGIONAL_ADMIN'])
  role: string;

  @ApiProperty({ description: 'Country ID (required for regional_admin)', example: 1 })
  @IsOptional()
  @IsInt()
  countryId?: number;
}

export class EditAdminDto {
  @ApiProperty({ description: 'Email of the admin', example: 'admin@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Password for the admin', example: 'securepassword', required: false })
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'First name of the admin', example: 'John' })
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ description: 'Last name of the admin', example: 'Doe' })
  @IsNotEmpty()
  lastName: string
  
  @ApiProperty({ description: 'Role of the admin', enum: ['SUPER_ADMIN', 'REGIONAL_ADMIN'], required: false })
  @IsOptional()
  @IsEnum(['SUPER_ADMIN', 'REGIONAL_ADMIN'])
  role?: string;

  @ApiProperty({ description: 'Country ID (required for REGIONAL_ADMIN)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  countryId?: number;
}
