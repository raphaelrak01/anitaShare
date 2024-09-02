import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Supabase } from '../supabase/supabase';
import { isEmptyObject } from 'src/common/helpers/validation.helpers';
import { Stripe } from 'stripe';
import { Billing } from './models/billing.model';
import { QueuesService } from 'src/queues/queues.service';

@Injectable()
export class BillingsService {
  private readonly logger: Logger = new Logger(BillingsService.name);
  constructor(private readonly queueService: QueuesService) {}

  @OnEvent('payment-event')
  private async listenForPaymentEvents(stripeEvent: Stripe.Event) {
    this.queueService.addTaskToStripeEventQueue(stripeEvent);
  }
}
