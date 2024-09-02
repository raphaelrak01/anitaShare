import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ELinkingEventName } from '../enums/linking-event-name.enum';
import { Linking } from '../models/linking.model';

export class UpdateLinkingDto {
  @ApiProperty({
    required: true,
    enum: [
      ...Object.values(Linking.CUSTOMER_ALLOWED_ACTIONS),
      ...Object.values(Linking.FLIIINKER_ALLOWED_ACTIONS),
    ],
    description: `The actions a user can perform on a linking. <br> - Actions allowed for customer :  [ ${Object.values(Linking.CUSTOMER_ALLOWED_ACTIONS)} ].<br> - Actions allowed for a fliiinker : [ ${Object.values(Linking.FLIIINKER_ALLOWED_ACTIONS)} ]`,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ELinkingEventName)
  action: ELinkingEventName;
}
