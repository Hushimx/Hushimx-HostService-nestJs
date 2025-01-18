import { ApiProperty } from "@nestjs/swagger";
import { PaginationAndSortingDto } from "src/dto/pagination.dto";
import  {IsOptional} from 'class-validator'
import { Type } from 'class-transformer';

export class QueryEventDto extends PaginationAndSortingDto {
    @ApiProperty({ description: 'Email of the admin', example: 'admin@example.com' })
    @IsOptional()
    email?: string;
  
    @ApiProperty({ description: 'title of the event', example: 'John' })
    @IsOptional()
    title?: string
    
  
  
    @ApiProperty({ description: 'Country ID (required for regional_admin)', example: 1 })
    @Type(() => Number) // Ensures the value is transformed to a number
    @IsOptional()
    country?: number;

    @ApiProperty({ description: 'Country ID (required for regional_admin)', example: 1 })
    @Type(() => Number) // Ensures the value is transformed to a number
    @IsOptional()
    city?: number;

}
  