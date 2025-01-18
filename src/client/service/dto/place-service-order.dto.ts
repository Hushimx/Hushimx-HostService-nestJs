// dto/place-service-order.dto.ts
import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlaceServiceOrderDto {
  @ApiProperty({ example: 'laundry-service', description: 'Slug of the service to order' })
  @IsString()
  slug: string;


  @ApiProperty({
    example: 'Please complete by end of day',
    description: 'Additional notes for the service order',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
