import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TestFcmDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  token: string;
}
