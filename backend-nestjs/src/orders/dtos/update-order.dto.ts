import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EOrderEventName } from '../enums/order-event-name.enum';
import { Order } from '../models/order.model';

export class UpdateOrderDto {
  @ApiProperty({
    required: true,
    enum: [
      ...Object.values(Order.CUSTOMER_ALLOWED_ACTIONS),
      ...Object.values(Order.FLIIINKER_ALLOWED_ACTIONS),
    ],
    description: `The actions a user can perform on a linking. <br> - Actions allowed for customer :  [ ${Object.values(Order.CUSTOMER_ALLOWED_ACTIONS)} ].<br> - Actions allowed for a fliiinker : [ ${Object.values(Order.FLIIINKER_ALLOWED_ACTIONS)} ]`,
    default: EOrderEventName.FLIIINKER_ON_THE_WAY,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(EOrderEventName)
  action: EOrderEventName;
}
