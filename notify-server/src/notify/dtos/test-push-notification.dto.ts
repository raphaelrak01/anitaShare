import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TestPushNotificationDto {
  @ApiProperty({
    required: true,
    description: 'Fcm token for test',
  })
  @IsNotEmpty()
  @IsString()
  fcm_token?: string;
}
