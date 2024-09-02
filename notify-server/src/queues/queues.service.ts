import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { environnement } from 'src/common/environnement';

@Injectable()
export class QueuesService {
  private readonly logger: Logger = new Logger(QueuesService.name);
  private readonly allQueues: Array<Queue>;
  constructor(
    @InjectQueue(environnement().bull.queues.test_notification_queue)
    private testNotificationQueue: Queue,
    @InjectQueue(
      environnement().bull.queues.linking_created_event_notification_queue,
    )
    private firstFliiinkerNotificationQueue: Queue,
    @InjectQueue(environnement().bull.queues.linking_event_notification_queue)
    private linkingNotificationsQueue: Queue,
    @InjectQueue(environnement().bull.queues.payment_event_notification_queue)
    private paymentNotificationQueue: Queue,
  ) {
    this.allQueues = [
      this.testNotificationQueue,
      this.firstFliiinkerNotificationQueue,
      this.linkingNotificationsQueue,
      this.paymentNotificationQueue,
    ];

    try {
      this.logger.log('Check Redis-Queues connection');
      this.checkAllQueuesAvailability();
      this.logger.log('Notify-Server is ready for listening on all queues');
    } catch (e) {
      this.logger.error(e);
      process.exit(1);
    }
  }

  private async checkAllQueuesAvailability(): Promise<void> {
    await Promise.all(
      this.allQueues.map((queue) => this.checkQueueAvailability(queue)),
    );
  }

  private checkQueueAvailability(queue: Queue): Promise<void> {
    return new Promise((resolve, reject) => {
      queue.client.on('connect', () => {
        this.logger.log(`Queue ${queue.name} : connect`);
      });
      queue.client.on('wait', () => {
        this.logger.log(`Queue ${queue.name} : wait`);
      });
      queue.client.on('connecting', () => {
        this.logger.log(`Queue ${queue.name} : connecting`);
      });

      queue.client.on('end', () => {
        this.logger.log(`Queue ${queue.name} : end`);
      });

      queue.client.on('close', () => {
        this.logger.log(`Queue : ${queue.name} : close`);
      });

      queue.client.on('reconnecting', () => {
        this.logger.log(`Queue :  ${queue.name} : reconnecting`);
      });

      queue.client.on('ready', () => {
        this.logger.log(`Notify-Server is ready for queue: ${queue.name}`);
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
}
