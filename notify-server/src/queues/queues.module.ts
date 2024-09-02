import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { LinkingCreatedEventNotificationProcessor } from './processors/linking-created-event-notification.processor';
import { NotifyModule } from 'src/notify/notify.module';
import { environnement } from 'src/common/environnement';
import { QueuesService } from './queues.service';
import { LinkingEventNotificationProcessor } from './processors/linking-event-notification.processor';
import { PaymentEventNotificationProcessor } from './processors/payment-event-notification.processor';
import { TestNotificationProcessor } from './processors/test-notification.processor';
import { ChatMessageNotificationProcessor } from './processors/chat-message-notification.processor';
import { OrderEventNotificationProcessor } from './processors/order-event-notification.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: environnement().bull.redis_queues.host,
          port: environnement().bull.redis_queues.port,
        },
      }),
    }),
    BullModule.registerQueue({
      name: environnement().bull.queues.test_notification_queue,
    }),
    BullModule.registerQueue({
      name: environnement().bull.queues
        .linking_created_event_notification_queue,
    }),
    BullModule.registerQueue({
      name: environnement().bull.queues.linking_event_notification_queue,
    }),
    BullModule.registerQueue({
      name: environnement().bull.queues.payment_event_notification_queue,
    }),
    BullModule.registerQueue({
      name: environnement().bull.queues.chat_message_notification_queue,
    }),
    BullModule.registerQueue({
      name: environnement().bull.queues.order_event_notification_queue,
    }),
    NotifyModule,
  ],
  providers: [
    QueuesService,
    TestNotificationProcessor,
    LinkingCreatedEventNotificationProcessor,
    LinkingEventNotificationProcessor,
    PaymentEventNotificationProcessor,
    ChatMessageNotificationProcessor,
    OrderEventNotificationProcessor,
  ],
})
export class QueuesModule {}
