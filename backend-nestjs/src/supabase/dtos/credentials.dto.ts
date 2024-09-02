import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CredentialsDto {
  @ApiProperty({ required: true, default: 'borris-test-123@yopmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, default: 'tototo' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
