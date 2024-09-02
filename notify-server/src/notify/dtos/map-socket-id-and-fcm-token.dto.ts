import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MapSocketIdAndFcmTokenDto {
  @ApiProperty({
    required: true,
    description: 'User ID in Supabase',
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({
    required: false,
    description: 'User socket ID',
  })
  @IsOptional()
  @IsString()
  socket_id?: string;

  @ApiProperty({
    required: false,
    description: 'User fcm token ID',
  })
  @IsOptional()
  @IsString()
  fcm_token?: string;
}
