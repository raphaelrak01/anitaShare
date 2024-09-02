import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStepDto {
  @ApiProperty({
    example: 'Updated Step',
    description: 'The updated name of the step',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 2,
    description: 'The updated order of the step',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;
}
