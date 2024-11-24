import {
    IsInt,
    IsArray,
    ValidateNested,
    IsNumber,
    Min,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class OrderItemDto {
    @IsInt()
    productId: number;
  
    @IsInt()
    @Min(1)
    quantity: number;
  }
  
  export class PlaceOrderDto {
      @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
  }
  