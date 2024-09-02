import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateStripeUserDto {
  @ApiProperty({
    required: true,
    example: '6b59da40-76bf-44f2-a7da-8611ece7b277',
    description:
      'id from the public_profile table, which is a uuid and also foreign key from the auth.users table',
  })
  @IsNotEmpty()
  @IsString()
  public_profile_id: string;

  @ApiProperty({
    required: true,
    example: 'john.doe@email.com',
    description: 'email of the user, must be a valid email',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
