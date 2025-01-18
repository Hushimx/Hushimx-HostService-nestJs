import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ example: 'riyadh-admin@example.com', description: 'The user email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'securepassword', description: 'The user password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
