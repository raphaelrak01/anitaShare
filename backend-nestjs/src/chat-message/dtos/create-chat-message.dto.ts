import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatMessageDto {
  // @ApiProperty({ required: true })
  // @IsNotEmpty()
  // @IsNumber()
  // channel_id: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  message: string;
}
