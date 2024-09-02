import { EOrderEventName } from '../enums/order-event-name.enum';

export interface IOrderEvent {
  created_at: string;
  name: EOrderEventName;
}
