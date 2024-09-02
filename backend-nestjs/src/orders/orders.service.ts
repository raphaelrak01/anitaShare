import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Supabase } from 'src/supabase/supabase';
import Stripe from 'stripe';
import { Order } from './models/order.model';
import { EOrderStatus } from './enums/order-status.enum';
import { SupabaseUserType } from 'src/supabase/abstract-supabase-resource.model';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { EOrderEventName } from './enums/order-event-name.enum';
import { AuthUser } from '@supabase/supabase-js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(private readonly supabase: Supabase) {}

  public async getOrder(orderId: number, userType: SupabaseUserType = 'owner') {
    const order: Order = await this.supabase
      .getSupabaseResource(Order)
      .get({ resourceId: orderId, user: userType });

    return order;
  }

  public async updateOrder(
    currentUser: AuthUser,
    currentOrder: Order,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const { action } = updateOrderDto;

    const userRole = this.getCurrentUserRole(currentUser, currentOrder);
    currentOrder.performer_id = currentUser.id;

    if (!currentOrder.userCanDoAction(userRole, action)) {
      this.logger.error(
        'User not allowed to do this action or event already inserted',
      );
      throw new InternalServerErrorException(
        'User not allowed to do this action or event already inserted',
      );
    }

    switch (action) {
      case EOrderEventName.FLIIINKER_ON_THE_WAY:
        currentOrder.addEvent(EOrderEventName.FLIIINKER_ON_THE_WAY);

        break;
      case EOrderEventName.FLIIINKER_START_SERVICE:
        currentOrder.addEvent(EOrderEventName.FLIIINKER_START_SERVICE);

        break;
      case EOrderEventName.CUSTOMER_CONFIRM_START_SERVICE:
        currentOrder.addEvent(EOrderEventName.CUSTOMER_CONFIRM_START_SERVICE);

        break;
      case EOrderEventName.CUSTOMER_COMPLETE_SERVICE_BEFORE_DUE_DATE:
        currentOrder.addEvent(
          EOrderEventName.CUSTOMER_COMPLETE_SERVICE_BEFORE_DUE_DATE,
        );

        break;
      case EOrderEventName.FLIIINKER_COMPLETE_SERVICE:
        currentOrder.addEvent(EOrderEventName.FLIIINKER_COMPLETE_SERVICE);
        break;
      case EOrderEventName.CUSTOMER_CANCEL:
        currentOrder.addEvent(EOrderEventName.CUSTOMER_CANCEL);
        break;
      default:
        break;
    }

    await currentOrder.save();
    return currentOrder;
  }

  private getCurrentUserRole(
    currentUser: AuthUser,
    currentOrder: Order,
  ): 'customer' | 'fliiinker' {
    if (currentUser.id === currentOrder.fliiinker_id) {
      return 'fliiinker';
    }
    if (currentUser.id === currentOrder.customer_id) {
      return 'customer';
    }

    throw new InternalServerErrorException(
      'Current user id not found in order',
    );
  }

  @OnEvent('payment-event.succeeded')
  private async listenForPaymentEventSucceeded(stripeEvent: Stripe.Event) {
    const eventData = stripeEvent.data.object as Stripe.Subscription;
    const orderId = parseInt(eventData.metadata.order_id);
    const order: Order = await this.getOrder(orderId, 'stripe');
    order.addEvent(EOrderEventName.CONFIRM_PAYMENT);
    await order.save('stripe');
  }
}
