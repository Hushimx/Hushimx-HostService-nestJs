import {
    IsInt,
    IsArray,
    ValidateNested,
    IsNumber,
    IsString,
    Min,
  } from 'class-validator';
  import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { isString } from 'node:util';
  
  export class OrderItemDto {
    @IsInt()
    productId: number;
  
    @IsInt()
    @Min(1)
    quantity: number;
  }
  
  export class PlaceOrderDto {

    @IsString()
    @ApiProperty({ description: 'Store', example: 'restaurant' })
    store: string;

    @IsString()
    @ApiProperty({ description: 'Payment method', example: 'card' })
    paymentMethod: string;



    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
  }
  