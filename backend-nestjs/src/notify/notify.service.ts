import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { environment } from 'src/common/environment';
import * as fs from 'fs';
import { catchError, lastValueFrom, map } from 'rxjs';
import { OnEvent } from '@nestjs/event-emitter';
import { ILinkingNotificationData } from 'src/linkings/models/linking.model';
import { QueuesService } from 'src/queues/queues.service';
import { MapSocketIdAndFcmTokenDto } from './dtos/map-socket-id-and-fcm-token.dto';
import { AxiosError } from 'axios';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { ChatMessageDto } from 'src/chat-message/dtos/chat-message.dto';
import { LinkingDto } from 'src/linkings/dtos/linking.dto';
import { OrderDto } from 'src/orders/dtos/order.dto';
import { Profile } from 'src/common/decorators/profile.decorator';
import { IOrderNotificationData } from 'src/orders/models/order.model';
import Stripe from 'stripe';

@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name);
  private readonly baseUrl = environment().notify.url;

  constructor(
    private readonly httpService: HttpService,
    private queuesService: QueuesService,
  ) {}

  async sendTestNotification(sendNotificationDto: SendNotificationDto) {
    await this.queuesService.addTaskToTestNotificationQueue(
      sendNotificationDto,
    );
  }

  async testFcm(token: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post(`${this.baseUrl}/notify/test-fcm`, {
            token,
          })
          .pipe(
            map((res) => res.data),
            catchError((e) => {
              if (e.code === 'ECONNREFUSED') {
                throw new ServiceUnavailableException(
                  "Can't reach Notify Server",
                );
              }
              throw new HttpException(e.response.data, e.response.status);
            }),
          ),
      );
      return response;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async mapSocketIdAndFcmToken(
    user_id: string,
    mapSocketIdAndFcmTokenDto: MapSocketIdAndFcmTokenDto,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post(`${this.baseUrl}/notify/map`, {
            user_id,
            ...mapSocketIdAndFcmTokenDto,
          })
          .pipe(
            map((res) => res.data),
            catchError((e) => {
              if (e.code === 'ECONNREFUSED') {
                throw new ServiceUnavailableException(
                  "Can't reach Notify Server",
                );
              }
              throw new HttpException(e.response.data, e.response.status);
            }),
          ),
      );
      return response;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @OnEvent('search-created')
  private async handleSearchCreatedEvent(data: any) {
    const { search_id, service_id, fliiinkers_ids } = data;
    const notificationTemplates = this._getNotificationTemplates(
      'linking.notifications.json',
    );
    const notificationTemplate = notificationTemplates['link'];

    const sendNotificationDto = {
      users_ids: fliiinkers_ids,
      type: notificationTemplate.type,
      body: notificationTemplate.body['fr'],
      data: JSON.stringify({ search_id, service_id }),
      deep_link: notificationTemplate.deep_link,
      is_push: notificationTemplate.is_push,
      is_socket_event: notificationTemplate.is_socket_event,
      title: notificationTemplate.title['fr'],
    } as SendNotificationDto;

    this.queuesService.addTaskToFirstFliiinkerNotificationQueue(
      sendNotificationDto,
    );
  }

  @OnEvent('linking-event')
  private async handleLinkingEvent(data: {
    linkingDto: LinkingDto;
    linkingNotificationData: ILinkingNotificationData; // TODO: typer ceci
  }) {
    const { linkingDto, linkingNotificationData } = data;
    const notificationTemplates = this._getNotificationTemplates(
      'linking.notifications.json',
    );
    const notificationTemplate =
      notificationTemplates[linkingNotificationData.last_event_name];
    if (!notificationTemplate) return; // TODO: améliorer gestion des null

    const body = this._replaceNotifVariables(
      notificationTemplate?.body['fr'],
      linkingNotificationData,
    );

    const notificationDto = {
      users_ids: [
        linkingNotificationData.performer_id === linkingDto.customer_id
          ? linkingDto.fliiinker_id
          : linkingDto.customer_id,
      ],
      type: notificationTemplate.type,
      body,
      data: JSON.stringify(linkingDto),
      deep_link: notificationTemplate.deep_link,
      is_push: notificationTemplate.is_push,
      is_socket_event: notificationTemplate.is_socket_event,
      title: notificationTemplate.title['fr'],
    } as SendNotificationDto;

    await this.queuesService.addTaskToLinkingNotificationsQueue(
      notificationDto,
    );
  }
  @OnEvent('payment-event')
  private async handlePaymentEvent(stripeEvent: Stripe.Event) {
    const eventData = stripeEvent.data.object as Stripe.Subscription;
    const order_id = eventData.metadata.order_id;
    const customer_id = eventData.metadata.customer_id;
    const status = eventData.status;

    const safeEventData = {
      payment_id: eventData.id,
      status: eventData.status,
      created: status,
      customer_id: customer_id,
      order_id: order_id,
    };
    // console.log('__________________ notify service');
    // console.log(eventData);
    const notificationDto = {
      users_ids: [customer_id],
      type: 'payment-event',
      body: 'Etat du paiement mis à jour',
      data: JSON.stringify({ order_id, status, eventData }),
      deep_link: 'none',
      is_push: false,
      is_socket_event: true,
      title: 'Etat du paiement mis à jour',
    };

    await this.queuesService.addTaskToPaymentNotificationQueue(notificationDto);
  }

  @OnEvent('order-event')
  @Profile()
  private async handleOrderEvent(data: {
    orderDto: OrderDto;
    orderNotificationData: IOrderNotificationData;
  }) {
    const { orderDto, orderNotificationData } = data;
    const notificationTemplates = this._getNotificationTemplates(
      'order.notifications.json',
    );
    const notificationTemplate =
      notificationTemplates[orderNotificationData.last_event_name];
    if (!notificationTemplate) {
      this.logger.error(
        'No notification template found for ',
        orderNotificationData.last_event_name,
      );
      throw new InternalServerErrorException('No notification template found');
    }
    // console.log('shoooow order-event data in notify service');
    // console.log(data.orderDto.events);
    const body = this._replaceNotifVariables(
      notificationTemplate?.body['fr'],
      orderNotificationData,
    );
    // console.log(
    //   '________________________________mid of handleOrderEvent fonction',
    // );
    const notificationDto = {
      users_ids: orderNotificationData.recipients,
      type: notificationTemplate.type,
      body,
      data: JSON.stringify(orderDto),
      deep_link: notificationTemplate.deep_link,
      is_push: notificationTemplate.is_push,
      is_socket_event: notificationTemplate.is_socket_event,
      title: notificationTemplate.title['fr'],
    } as SendNotificationDto;
    // console.log(notificationDto);
    // console.log(
    //   '________________________________End of handleOrderEvent fonction',
    // );

    await this.queuesService.addTaskToOrderEventQueue(notificationDto);
  }

  @OnEvent('chat.message.created')
  private async handleChatMessageCreatedEvent(chatMessage: ChatMessageDto) {
    const notificationDto = {
      users_ids: chatMessage.other_users_in_channel,
      type: 'chat-message',
      body: chatMessage.message,
      data: JSON.stringify(chatMessage),
      deep_link: 'none',
      is_push: false,
      is_socket_event: true,
      title: 'Message chat',
    };

    await this.queuesService.addTaskToChatMessageNotificationQueue(
      notificationDto,
    );
  }

  private _replaceNotifVariables(
    content: string,
    notificationData: ILinkingNotificationData | IOrderNotificationData,
  ) {
    // console.log('________________________Replace fonction');
    // console.log(content);
    // console.log(notificationData);

    const transformedContent = content
      .replace('$fliiinker_first_name', notificationData.fliiinker.first_name)
      .replace('$customer_first_name', notificationData.customer.first_name);
    // console.log(transformedContent);
    return transformedContent;
  }

  private _getNotificationTemplates(file: string): any {
    try {
      const notificationTemplates = fs.readFileSync(
        environment().notify.templates + file,
      );
      return JSON.parse(notificationTemplates.toString());
    } catch (err) {
      console.error('Error while retrieving messages', err);
    }
  }

  private handleAxiosErrors(axiosError: AxiosError) {
    this.logger.error(axiosError?.response?.data);

    if (axiosError.code === 'ECONNREFUSED') {
      this.logger.error("Can't reach Notify Server");
      throw new ServiceUnavailableException("Can't reach Notify Server");
    }
    throw new HttpException(axiosError.message, axiosError.response.status);
  }
}
