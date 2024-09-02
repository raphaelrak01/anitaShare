import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ELinkingStatus } from '../enums/linking-status.enum';

export class LinkingDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsDateString()
  created_at: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsDateString()
  updated_at: string;

  @ApiProperty({ required: true, enum: Object.values(ELinkingStatus) })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ELinkingStatus)
  status: ELinkingStatus;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  customer_id: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  fliiinker_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  events?: Array<any>; // TODO: créer linking event dto

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  dist_meters: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  fliiinker_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fliiinker_avatar?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  fliiinker_rating: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  fliiinker_is_validated: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  fliiinker_is_pro: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  total_price: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  service_duration: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  fliiinker_service_hourly_rate: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  search_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order_id?: number;
}
