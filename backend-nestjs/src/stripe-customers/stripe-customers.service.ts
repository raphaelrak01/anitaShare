import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { StripeService } from 'src/stripe/stripe.service';
import { Supabase } from 'src/supabase/supabase';
import { CreateStripeUserDto } from './dtos/create-stripe-user.dto';
import { isEmptyObject } from 'src/common/helpers/validation.helpers';

@Injectable()
export class StripeCustomersService {
  private readonly logger = new Logger(StripeCustomersService.name);
  constructor(
    private readonly supabase: Supabase,
    private readonly stripeService: StripeService,
  ) {}

  async createStripeCustomer(
    createStripeUserDto: CreateStripeUserDto,
  ): Promise<PostgrestSingleResponse<any>> {
    const { public_profile_id, email } = createStripeUserDto;
    const stripeCustomer = await this.stripeService.createStripeCustomer(
      public_profile_id,
      email,
    );
    const { data: appStripeCustomer, error } = await this.supabase
      .getClient('stripe') // TODO:protéger la route qui appelle cette methode
      .from('stripe_customer')
      .insert({
        stripe_id: stripeCustomer.id,
        public_profile_id: public_profile_id,
      })
      .select()
      .single();

    if (error && !isEmptyObject(error)) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }

    return appStripeCustomer;
  }
}
