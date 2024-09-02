import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { environnement } from 'src/common/environnement';
import { NotificationDto } from 'src/notify/dtos/notification.dto';
import { NotifyService } from 'src/notify/notify.service';

@Processor(environnement().bull.queues.payment_event_notification_queue)
export class PaymentEventNotificationProcessor {
  private readonly logger: Logger = new Logger(
    PaymentEventNotificationProcessor.name,
  );
  constructor(private readonly notifyService: NotifyService) {}

  @Process(environnement().bull.processors.payment_event_notification_processor)
  async handleProcessPaymentEventNotification(job: Job) {
    const notificationDto = job.data as NotificationDto;
    console.log(
      '--------------------------- handleProcessPaymentEventNotification',
    );
    console.log(notificationDto);
    try {
      const responses =
        await this.notifyService.sendNotification(notificationDto);
      this.logger.log(responses);
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }
}
