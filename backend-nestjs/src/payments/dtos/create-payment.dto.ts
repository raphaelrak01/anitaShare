import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ required: true, example: 451, description: 'Order ID' })
  @IsNotEmpty()
  @IsNumber()
  order_id: number;

  @ApiProperty({
    required: true,
    example: 26,
    description: 'Card ID selected by the user',
  })
  @IsNotEmpty()
  @IsNumber()
  selected_card_id: number;
}
