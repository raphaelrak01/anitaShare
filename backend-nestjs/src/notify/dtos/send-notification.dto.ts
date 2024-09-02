import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({
    required: true,
    description: 'Users ids',
  })
  @IsNotEmpty()
  @IsArray()
  users_ids: Array<string>;

  @ApiProperty({
    required: true,
    description: 'Title',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    required: true,
    description: 'Type',
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    required: true,
    description: 'Content',
  })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty({
    required: false,
    description: 'Data',
    default: '{}',
  })
  @IsOptional()
  @IsJSON()
  @IsString()
  data: string;

  @ApiProperty({
    required: false,
    description: 'Deep link',
  })
  @IsOptional()
  @IsString()
  deep_link?: string;

  @ApiProperty({
    required: true,
    description: 'Is Socket Event Notification',
  })
  @IsBoolean()
  is_socket_event?: boolean;

  @ApiProperty({
    required: true,
    description: 'Is Push Notification',
  })
  @IsBoolean()
  is_push?: boolean;
}
