import { Injectable } from '@nestjs/common';
import { StripeService } from 'src/stripe/stripe.service';
import { Supabase } from 'src/supabase/supabase';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { IEnrichedAuthUser } from 'src/common/interfaces/encriched-auth-user.interface';
import { CreditCardsService } from 'src/credit-cards/credit-cards.service';
import { OrdersService } from 'src/orders/orders.service';
import { Order } from 'src/orders/models/order.model';
import { Profile } from 'src/common/decorators/profile.decorator';
import { CreditCard } from 'src/credit-cards/models/credit-card.model';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly supabase: Supabase,
    private readonly creditCardsService: CreditCardsService,
    private readonly ordersService: OrdersService,
    private readonly stripeService: StripeService,
  ) {}

  @Profile()
  async createPayment(
    userData: IEnrichedAuthUser,
    order: Order,
    selectedCard: CreditCard,
  ): Promise<any> {
    const { user_stripe_data, public_profile } = userData;

    const paymentIntent = await this.stripeService.createPaymentIntent(
      order.billing.total_amount,
      order.id,
      public_profile.id,
      user_stripe_data.stripe_id,
      selectedCard.stripe_id,
    );

    return paymentIntent;
  }
}
