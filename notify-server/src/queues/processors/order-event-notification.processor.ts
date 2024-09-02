import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { environnement } from 'src/common/environnement';
import { NotificationDto } from 'src/notify/dtos/notification.dto';
import { NotifyService } from 'src/notify/notify.service';

@Processor(environnement().bull.queues.order_event_notification_queue)
export class OrderEventNotificationProcessor {
  private readonly logger: Logger = new Logger(
    OrderEventNotificationProcessor.name,
  );
  constructor(private readonly notifyService: NotifyService) {}

  @Process(environnement().bull.processors.order_event_notification_processor)
  async handleProcessOrderEventNotification(job: Job) {
    this.logger.log('Processing order event notification...');
    const notificationDto = job.data as NotificationDto;
    this.logger.debug('Sending message :', notificationDto.body);
    this.logger.debug('To :', notificationDto.users_ids);

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
