import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { environnement } from 'src/common/environnement';
import { NotificationDto } from 'src/notify/dtos/notification.dto';
import { NotifyService } from 'src/notify/notify.service';

@Processor(environnement().bull.queues.test_notification_queue)
export class TestNotificationProcessor {
  private readonly logger: Logger = new Logger(TestNotificationProcessor.name);

  constructor(private readonly notifyService: NotifyService) {}

  @Process(environnement().bull.processors.test_notification_processor)
  async handleProcessTestNotification(job: Job) {
    const notificationDto = job.data as NotificationDto;

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
