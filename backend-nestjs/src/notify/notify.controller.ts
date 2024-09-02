import { Body, Controller, Post } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MapSocketIdAndFcmTokenDto } from './dtos/map-socket-id-and-fcm-token.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUser } from '@supabase/supabase-js';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import { TestFcmDto } from './dtos/test-fcm.dto';
import { SendNotificationDto } from './dtos/send-notification.dto';

@ApiTags('Notify')
@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Post('/test-fcm')
  @ApiOperation({
    summary: 'Test FCM push notification',
    description: 'Endpoint use to test push notification with FCM',
  })
  @SupabaseGuard()
  testFcm(@CurrentUser() user: AuthUser, @Body() testFcmDto: TestFcmDto) {
    return this.notifyService.testFcm(testFcmDto.token);
  }

  @Post('/send-test-notification')
  @ApiOperation({
    summary: 'Test push and socket-events notification',
    description: 'Endpoint use to test push and socket-events notification',
  })
  @SupabaseGuard()
  testNotification(
    @CurrentUser() user: AuthUser,
    @Body() sendNotificationDto: SendNotificationDto,
  ) {
    return this.notifyService.sendTestNotification(sendNotificationDto);
  }

  @Post('/map')
  @ApiOperation({
    summary: 'Map Socket ID and FCM token',
    description:
      'Map Socket ID, in Notify Server, to allow one to one communication between the clients.',
  })
  @SupabaseGuard()
  mapping(
    @CurrentUser() currentUser: AuthUser,
    @Body() mapSocketIdAndFcmTokenDto: MapSocketIdAndFcmTokenDto,
  ) {
    return this.notifyService.mapSocketIdAndFcmToken(
      currentUser.id,
      mapSocketIdAndFcmTokenDto,
    );
  }
}
