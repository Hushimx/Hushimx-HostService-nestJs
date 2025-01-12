import { IsString, IsNotEmpty,IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Electronics',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCategoryDto  {
  @ApiPropertyOptional({
    description: 'Updated name of the category',
    example: 'Home Appliances',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
