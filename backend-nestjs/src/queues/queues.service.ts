import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { environment } from 'src/common/environment';
import { SendNotificationDto } from 'src/notify/dtos/send-notification.dto';
import Stripe from 'stripe';


@Injectable()
export class QueuesService {
  private readonly logger: Logger = new Logger(QueuesService.name);
  private readonly allQueues: Array<Queue>;
  constructor(
    @InjectQueue(environment().bull.queues.test_notification_queue)
    private testNotificationQueue: Queue,
    @InjectQueue(
      environment().bull.queues.linking_created_event_notification_queue,
    )
    private linkingCreatedEventNotificationQueue: Queue,
    @InjectQueue(environment().bull.queues.linking_event_notification_queue)
    private linkingEventNotificationQueue: Queue,
    @InjectQueue(environment().bull.queues.payment_event_notification_queue)
    private paymentEventNotificationQueue: Queue,
    @InjectQueue(environment().bull.queues.chat_message_notification_queue)
    private chatMessageNotificationQueue: Queue,
    @InjectQueue(environment().bull.queues.stripe_event_queue)
    private stripeEventQueue: Queue,
    @InjectQueue(environment().bull.queues.order_event_notification_queue)
    private orderEventQueue: Queue,
  ) {
    this.allQueues = [
      this.testNotificationQueue,
      this.linkingCreatedEventNotificationQueue,
      this.linkingEventNotificationQueue,
      this.paymentEventNotificationQueue,
      this.chatMessageNotificationQueue,
      this.stripeEventQueue,
      this.orderEventQueue,
    ];

    try {
      this.logger.log('Check Redis-Queue connection');
      this.checkAllQueuesAvailability();
      this.logger.log('Fliiink-Backend is ready for listening on all queues');
    } catch (e) {
      this.logger.error(e);
      process.exit(1);
    }
  }

  // 
  private async checkAllQueuesAvailability(): Promise<void> {
    await Promise.all(
      this.allQueues.map((queue) => this.checkQueueAvailability(queue)),
    );
  }

  private checkQueueAvailability(queue: Queue): Promise<void> {
    return new Promise((resolve, reject) => {
      queue.client.on('connect', () => {
        this.logger.debug(`Queue ${queue.name} : connect`);
      });
      queue.client.on('wait', () => {
        this.logger.debug(`Queue ${queue.name} : wait`);
      });
      queue.client.on('connecting', () => {
        this.logger.debug(`Queue ${queue.name} : connecting`);
      });

      queue.client.on('end', () => {
        this.logger.debug(`Queue ${queue.name} : end`);
      });

      queue.client.on('close', () => {
        this.logger.debug(`Queue : ${queue.name} : close`);
      });

      queue.client.on('reconnecting', () => {
        this.logger.debug(`Queue :  ${queue.name} : reconnecting`);
      });

      queue.client.on('ready', () => {
        this.logger.log(`Fliiink-Backend is ready for queue: ${queue.name}`);
        resolve();
      });
      queue.client.on('error', (error) => {
        reject(
          new Error(
            `Redis not available for queue ${queue.name}: ${error.message}`,
          ),
        );
      });
    });
  }

  async addTaskToTestNotificationQueue(data: SendNotificationDto) {
    await this.testNotificationQueue.add(
      environment().bull.processors.test_notification_processor,
      data,
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }

  async addTaskToFirstFliiinkerNotificationQueue(data: SendNotificationDto) {
    await this.linkingCreatedEventNotificationQueue.add(
      environment().bull.processors
        .linking_created_event_notification_processor,
      data,
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }

  async addTaskToLinkingNotificationsQueue(data: SendNotificationDto) {
    await this.linkingEventNotificationQueue.add(
      environment().bull.processors.linking_event_notification_processor,
      data,
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }

  // queue qui gère les evenement stripe à renvoyer aux >>> clients
  async addTaskToPaymentNotificationQueue(data: SendNotificationDto) {
    await this.paymentEventNotificationQueue.add(
      environment().bull.processors.payment_event_notification_processor,
      data,
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }
  async addTaskToChatMessageNotificationQueue(data: SendNotificationDto) {
    await this.chatMessageNotificationQueue.add(
      environment().bull.processors.chat_message_notification_processor,
      data,
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }

  // queue qui gère les évenement de changement status dans billing directions >>>> supabase
  async addTaskToStripeEventQueue(data: Stripe.Event) {
    await this.stripeEventQueue.add(
      environment().bull.processors.stripe_event_processor,
      data,
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }
  async addTaskToOrderEventQueue(data: SendNotificationDto) {
    console.group('data ----processor send to redis addtasktoordereventqueue');
    console.log(data);
    await this.orderEventQueue.add(
      environment().bull.processors.order_event_notification_processor,
      data,
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }
}
