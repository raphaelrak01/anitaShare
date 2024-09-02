import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsDateString()
  created_at: Date | string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  channel_id: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  sender_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  other_users_in_channel: Array<string>;
}
