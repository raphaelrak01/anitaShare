import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsJSON,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import * as dayjs from 'dayjs';

export class CreateResearchDto {
  @ApiProperty({
    required: true,
    description:
      'ID of the service for which the search is carried out (cleaning, cooking, babysitting, etc.)',
    default: 26,
  })
  @IsNotEmpty()
  @IsNumber()
  service_id: number;

  @ApiProperty({
    required: true,
    description: 'Date and time of start of the service, ISOstring format',
    default: dayjs().toISOString(),
  })
  @IsNotEmpty()
  @IsDateString()
  service_start: string;

  @ApiProperty({
    required: true,
    description: 'Date and time of end of the service, ISOstring format',
    default: dayjs().add(1, 'hour').toISOString(),
  })
  @IsNotEmpty()
  @IsDateString()
  service_end: string;

  @ApiProperty({
    required: true,
    description: 'Duration of the service, in minutes',
    default: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  service_duration: number;

  @ApiProperty({
    required: true,
    description: 'Customer selected address id',
    default: 1054,
  })
  @IsNotEmpty()
  @IsNumber()
  customer_selected_address_id: number;

  @ApiProperty({
    required: true,
    description: `Latitude of the customer's location`,
    example: '-20.9895672728258',
    default: '-20.9895672728258',
  })
  @IsLatitude()
  customer_latitude: string;

  @ApiProperty({
    required: true,
    description: `Longitude of the customer's location`,
    example: '55.5363496683167',
    default: '55.5363496683167',
  })
  @IsLongitude()
  customer_longitude: string;

  @ApiProperty({
    required: true,
    description: `City of the customer's location`,
    example: 'Saint-Denis',
    default: 'Saint-Denis',
  })
  @IsString()
  customer_city: string;

  @ApiProperty({
    required: true,
    description: ' Details of the service requested, in JSON format',
    default: '{}',
    example: '{"children_number": 2, "youngest_child_age": 1}', //TODO: add schema for this
  })
  @IsNotEmpty()
  @IsJSON()
  search_details: string;
}
