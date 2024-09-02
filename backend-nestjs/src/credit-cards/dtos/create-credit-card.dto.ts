import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCreditCardDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  name: string;
}
