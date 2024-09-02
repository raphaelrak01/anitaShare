import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BillingsService } from 'src/billings/billings.service';
import { Billing } from 'src/billings/models/billing.model';
import { environment } from 'src/common/environment';
import { Supabase } from 'src/supabase/supabase';
import Stripe from 'stripe';

@Processor(environment().bull.queues.stripe_event_queue)
export class StripeEventProcessor {
  private readonly logger: Logger = new Logger(StripeEventProcessor.name);

  constructor(
    private supabase: Supabase,
    private readonly billingService: BillingsService,
  ) {}

  @Process(environment().bull.processors.stripe_event_processor)
  async handleProcessStripeEvent(job: Job) {
    const stripeEvent = job.data as Stripe.Event;
    const eventData = stripeEvent.data.object as Stripe.Subscription;
    const orderId = eventData.metadata.order_id;

    const billing: Billing = await this.supabase
      .getSupabaseResource(Billing)
      .get({ resourceId: null, orderId: +orderId, user: 'stripe' });

    await billing.addEvent(stripeEvent).save();
  }
}
