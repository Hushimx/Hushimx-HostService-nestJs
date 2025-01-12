import { ApiProperty } from "@nestjs/swagger"
import { PaginationAndSortingDto } from "src/admin/dto/pagination.dto"
import  {IsOptional} from 'class-validator'

export class QueryClientDto extends PaginationAndSortingDto {
    // @ApiProperty({ description: 'Country ID', example: 1 })
    // @IsOptional()
    // country: number
    // @ApiProperty({ description: 'City ID', example: 1 })
    // @IsOptional()
    // city: number

    @ApiProperty({ description: 'Client ID', example: 1 })
    @IsOptional()
    clientId: number

    @ApiProperty({ description: 'Client Phone number', example: '966596000913' })
    @IsOptional()
    phoneNo: string

}