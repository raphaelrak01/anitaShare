import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueuesService } from './queues.service';
import { environment } from 'src/common/environment';
import { StripeEventProcessor } from './processors/stripe-event.processor';
import { BillingsModule } from 'src/billings/billings.module';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [
    SupabaseModule,
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: environment().redis.host,
          port: environment().redis.port,
        },
      }),
    }),
    BullModule.registerQueue({
      name: environment().bull.queues.test_notification_queue,
    }),
    BullModule.registerQueue({
      name: environment().bull.queues.linking_created_event_notification_queue,
    }),
    BullModule.registerQueue({
      name: environment().bull.queues.linking_event_notification_queue,
    }),
    BullModule.registerQueue({
      name: environment().bull.queues.payment_event_notification_queue,
    }),
    BullModule.registerQueue({
      name: environment().bull.queues.chat_message_notification_queue,
    }),
    BullModule.registerQueue({
      name: environment().bull.queues.stripe_event_queue,
    }),
    BullModule.registerQueue({
      name: environment().bull.queues.order_event_notification_queue,
    }),
    forwardRef(() => BillingsModule),
  ],
  providers: [QueuesService, StripeEventProcessor],
  exports: [QueuesService],
})
export class QueuesModule {}
