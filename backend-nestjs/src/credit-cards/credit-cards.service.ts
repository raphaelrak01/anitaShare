import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { StripeService } from 'src/stripe/stripe.service';
import { Supabase } from 'src/supabase/supabase';
import { CreateCreditCardDto } from './dtos/create-credit-card.dto';
import { isEmptyObject } from 'src/common/helpers/validation.helpers';
import { IEnrichedAuthUser } from 'src/common/interfaces/encriched-auth-user.interface';

@Injectable()
export class CreditCardsService {
  private readonly logger = new Logger(CreditCardsService.name);
  constructor(
    private readonly supabase: Supabase,
    private readonly stripeService: StripeService,
  ) {}

  async getUserCreditCards(userId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('stripe_customer')
      .select('*, cards: stripe_card(*)')
      .eq('public_profile_id', userId)
      .single();

    if (error && !isEmptyObject(error)) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
    return data.cards;
  }

  async getCreditCard(creditCardId: number) {
    const { data, error } = await this.supabase
      .getClient()
      .from('stripe_card')
      .select('*')
      .eq('id', creditCardId)
      .single();

    if (error && !isEmptyObject(error)) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async createCreditCard(
    userId: string,
    createCreditCardDto: CreateCreditCardDto,
  ): Promise<any> {
    const { token, name } = createCreditCardDto;

    const { data: appStripeCustomer, error } = await this.supabase
      .getClient()
      .from('stripe_customer')
      .select('*')
      .eq('public_profile_id', userId)
      .single();

    if (error && !isEmptyObject(error)) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }

    if (!appStripeCustomer)
      throw new NotFoundException('Stripe User not found in Supabase');

    const stripeCard =
      await this.stripeService.createStripePaymentMethod(token);

    await this.stripeService.attachPaymentMethod(
      stripeCard.id,
      appStripeCustomer.stripe_id,
    );

    if (!stripeCard) throw new Error('Card not created in Stripe');

    const { data: appCreditCard, error: appCreditCardError } =
      await this.supabase
        .getClient()
        .from('stripe_card')
        .insert({
          stripe_id: stripeCard.id,
          name: name ?? 'UNKNOWN',
          brand: stripeCard.card.brand,
          last_digits: stripeCard.card.last4,
          exp_month: stripeCard.card.exp_month,
          exp_year: stripeCard.card.exp_year,
          stripe_customer_id: appStripeCustomer.id,
        })
        .select()
        .single();

    if (appCreditCardError && !isEmptyObject(appCreditCardError)) {
      this.logger.error(appCreditCardError);
      throw new InternalServerErrorException(appCreditCardError.message);
    }
    if (!appCreditCard)
      throw new InternalServerErrorException('Card not created in Supabase');

    return appCreditCard;
  }

  async deleteCreditCard(
    userData: IEnrichedAuthUser,
    cardId: number,
  ): Promise<any> {
    const { user_stripe_data } = userData;

    const creditCard = await this.getCreditCard(cardId);
    if (!creditCard || creditCard.stripe_customer_id !== user_stripe_data.id)
      throw new Error('Card not found for this user');

    const stripeDeletedResponse =
      await this.stripeService.deleteStripePaymentMethod(creditCard.stripe_id);

    if (stripeDeletedResponse.customer === null) {
      const response = await this.supabase
        .getClient()
        .from('stripe_card')
        .delete()
        .eq('id', cardId);
      return response;
    }
  }
}
