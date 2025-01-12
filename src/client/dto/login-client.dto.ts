import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'node:crypto';

export class checkRoomAvailability {

@ApiProperty({
  description: 'Send UUID To check room availability',
  example: '123e4567-e89b-12d3-a456-426614174000',
})
@IsString()
uuid: UUID;


}
export class ClientLoginDto {
  @ApiProperty({
    description: 'The UUID of the client used to identify the client in the login process',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  uuid: UUID;

  @ApiProperty({
    description: 'The Phone number of the client, Make sure to include the country code and number shouldn not start with zero.',
    example: '966596000912',
  })
  phoneNumber: string;
}
