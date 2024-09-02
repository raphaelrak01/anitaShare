import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MapSocketIdAndFcmTokenDto } from './dtos/map-socket-id-and-fcm-token.dto';
import { NotifyService } from './notify.service';
import { TestPushNotificationDto } from './dtos/test-push-notification.dto';
import { NotificationDto } from './dtos/notification.dto';

@ApiTags('Notify')
// route: /notify
@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}
  
  // route POST /notify/map
  @Post('/map')

  // méthode mapSocketIdAndFcmToken() qui prend en paramètre un objet de type MapSocketIdAndFcmTokenDto
  // et qui retourne une promesse de type any et qui appelle la méthode mapSocketIdAndFcmToken() du service NotifyService
  async mapSocketIdAndFcmToken(
    @Body() mapSocketIdAndCfmTokenDto: MapSocketIdAndFcmTokenDto,
  ): Promise<any> {
    return this.notifyService.mapSocketIdAndFcmToken(mapSocketIdAndCfmTokenDto);
  }

  // route POST /notify/test-fcm
  @Post('/test-fcm')
  // méthode testPushNotification() qui prend en paramètre un objet de type TestPushNotificationDto
  // et qui retourne une promesse de type any et qui appelle la méthode testPushNotification() du service NotifyService
  async testPushNotification(
    @Body() testPushNotificationDto: TestPushNotificationDto,
  ): Promise<any> {
    const { fcm_token } = testPushNotificationDto;
    return this.notifyService.testPushNotification(fcm_token);
  }

  @Post()
  // route POST /notify
  async sendNotification(
    // méthode sendNotification() qui prend en paramètre un objet de type NotificationDto
    @Body() notificationDto: NotificationDto,
  ): Promise<any> {
    return this.notifyService.sendNotification(notificationDto);
  }
}
