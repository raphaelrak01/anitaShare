import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStepDto {
  @ApiProperty({ example: 'Step 1', description: 'The name of the step' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'The order of the step' })
  @IsNumber()
  @IsNotEmpty()
  order: number;
}
