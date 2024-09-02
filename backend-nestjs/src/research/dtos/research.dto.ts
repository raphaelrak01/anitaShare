import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ResearchDto {
  @ApiProperty({
    required: true,
    description: 'Search ID',
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    required: true,
    description:
      'ID of the service for which the search is carried out (cleaning, cooking, babysitting, etc.)',
  })
  @IsNotEmpty()
  @IsNumber()
  service_id: number;

  @ApiProperty({
    required: true,
    description: 'Duration of the service, in minutes',
  })
  @IsNotEmpty()
  @IsNumber()
  service_duration: number;

  @ApiProperty({
    required: true,
    description: 'Date and time of start of the service, ISOstring format',
  })
  @IsNotEmpty()
  @IsDateString()
  service_start: string;

  @ApiProperty({
    required: true,
    description: 'Date and time of end of the service, ISOstring format',
  })
  @IsNotEmpty()
  @IsDateString()
  service_end: string;

  @ApiProperty({
    required: true,
    description: 'ID of the customer',
  })
  @IsNotEmpty()
  @IsString()
  customer_id: string;

  @ApiProperty({
    required: true,
    description: ' Details of the service requested, in JSON format',
  })
  @IsNotEmpty()
  @IsJSON()
  search_details: string;

  @ApiProperty({
    required: true,
    description: 'Total number of linkings associated with this search',
  })
  @IsNotEmpty()
  @IsNumber()
  linkings_number: number;

  @ApiProperty({
    required: true,
    description: 'Linkings associated with this search',
  })
  @IsOptional()
  @IsArray()
  linkings?: Array<any>;
}
