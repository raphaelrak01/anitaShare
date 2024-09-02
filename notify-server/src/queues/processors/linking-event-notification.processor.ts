import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { environnement } from 'src/common/environnement';
import { NotificationDto } from 'src/notify/dtos/notification.dto';
import { NotifyService } from 'src/notify/notify.service';

@Processor(environnement().bull.queues.linking_event_notification_queue)
export class LinkingEventNotificationProcessor {
  private readonly logger: Logger = new Logger(
    LinkingEventNotificationProcessor.name,
  );
  constructor(private readonly notifyService: NotifyService) {}

  @Process(environnement().bull.processors.linking_event_notification_processor)
  async handleProcessLinkingEventNotification(job: Job) {
    this.logger.log('Processing linking event notification...');
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
