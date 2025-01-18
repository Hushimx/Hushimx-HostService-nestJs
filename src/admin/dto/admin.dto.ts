import { IsEmail, IsNotEmpty, IsOptional,IsString,Min, Max, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PaginationAndSortingDto } from '../../dto/pagination.dto';

export class GetAdminsQueryDto extends PaginationAndSortingDto {
  @ApiProperty({ description: 'Email of the admin', example: 'admin@example.com' })
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'First name of the admin', example: 'John' })
  @IsOptional()
  name?: string
  
  @ApiProperty({ description: 'Role of the admin', enum: ['SUPER_ADMIN', 'REGIONAL_ADMIN'] })
  @IsOptional()
  @IsEnum(Role, { message: 'role must be a valid enum value (SUPER_ADMIN or REGIONAL_ADMIN)' })

  role?: Role;

  @ApiProperty({ description: 'Country ID (required for regional_admin)', example: 1 })
  @Type(() => Number) // Ensures the value is transformed to a number
  @IsOptional()
  country?: number;
}


export class CreateAdminDto {
  @ApiProperty({ description: 'Email of the admin', example: 'admin@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the admin', example: 'securepassword' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: ' name of the admin', example: 'John' })
  @IsNotEmpty()
  name: string
  
  @ApiProperty({ description: 'Role of the admin', enum: ['SUPER_ADMIN', 'REGIONAL_ADMIN'] })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: 'Country ID (required for regional_admin)', example: 1 })
  @IsOptional()
  @Type(() => Number) // Ensures the value is transformed to a number
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
  @IsOptional()
  name?: string
  
  @ApiProperty({ description: 'Role of the admin', enum: ['SUPER_ADMIN', 'REGIONAL_ADMIN'], required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ description: 'Country ID (required for REGIONAL_ADMIN)', example: 1, required: false })
  @IsOptional()
  @Type(() => Number) // Ensures the value is transformed to a number
  @IsInt()
  countryId?: number;
}
