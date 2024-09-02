import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class OrderDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsDateString()
  created_at: Date | string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsDateString()
  start_date: Date | string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsDateString()
  end_date: Date | string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  service_id: number;

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsNumber()
  channel_id?: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  customer_id: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  fliiinker_id: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  events: Array<any>;
}
