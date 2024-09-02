import { InternalServerErrorException } from '@nestjs/common';
import { Billing } from 'src/billings/models/billing.model';
import {
  AbstractSupabaseResource,
  SupabaseUserType,
} from 'src/supabase/abstract-supabase-resource.model';
import { OrderDto } from '../dtos/order.dto';
import { EOrderEventName } from '../enums/order-event-name.enum';
import { IOrderEvent } from '../interfaces/order-event.interface';
import { EOrderStatus } from '../enums/order-status.enum';
import { AuthUser } from '@supabase/supabase-js';

export class Order extends AbstractSupabaseResource {
  // in table
  private _id: number;
  private _created_at: Date | string;
  private _start_date: Date | string;
  private _end_date: Date | string;
  private _status: string;
  private _service_id: number;
  private _customer_id: string;
  private _fliiinker_id: string;
  private _channel_id?: number;

  private _events: Array<any> = [];

  // extra data (not in table)
  // extra data (not in table)
  private _performer_id: string;
  private _customer?: any;
  private _fliiinker?: any;
  private _billing: Billing;

  public static readonly CUSTOMER_ALLOWED_ACTIONS = [
    EOrderEventName.CUSTOMER_CONFIRM_START_SERVICE,
    EOrderEventName.CUSTOMER_COMPLETE_SERVICE_BEFORE_DUE_DATE,
    EOrderEventName.CUSTOMER_CANCEL,
  ];
  public static readonly FLIIINKER_ALLOWED_ACTIONS = [
    EOrderEventName.FLIIINKER_ON_THE_WAY,
    EOrderEventName.FLIIINKER_START_SERVICE,
    EOrderEventName.FLIIINKER_COMPLETE_SERVICE,
  ];

  async get(params: {
    user?: SupabaseUserType;
    resourceId: string | number;
  }): Promise<Order> {
    const { resourceId: orderId, user } = params;
    const { data, error } = await this.supabase
      .getClient(user)
      .from('order')
      .select(
        '*, billing: billing(*), customer: public_profile!public_order_customer_id_fkey(id, email, first_name, last_name), fliiinker: public_profile!public_order_fliiinker_id_fkey(id, email, first_name, last_name)',
      )
      .eq('id', orderId)
      .single();

    if (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }

    if (data) {
      console.log('-------------data to map');
      console.log(data);
      this.mapData(data);
    }
    return this;
  }
  create(params: any): Order {
    throw new Error('Method not implemented.');
  }
  async save(user?: SupabaseUserType): Promise<Order> {
    if (this.id) {
      const { data, error } = await this.supabase
        .getClient(user)
        .from('order')
        .update({
          status: this.status,
          events: JSON.parse(JSON.stringify(this.events)),
        })
        .eq('id', this.id)
        .select()
        .single();

      if (data) {
        this.mapData(data);
        this._emitEvent();
      }

      if (error) {
        console.error({ supabaseError: error });
        throw new InternalServerErrorException({
          supabaseError: error,
        });
      }
    }

    return this;
  }

  mapData(data: any) {
    this.id = data.id;
    this.created_at = data.created_at;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.status = data.status;
    this.service_id = data.service_id;
    this.customer_id = data.customer_id;
    this.fliiinker_id = data.fliiinker_id;
    this.events = data.events;
    this.customer = (data.customer ?? this.customer) || 'Un client';
    this.fliiinker = (data.fliiinker ?? this.fliiinker) || 'Un fliiinker';
    if (data.billing) {
      this.billing = new Billing(this.supabase, this.eventEmitter).mapData(
        data.billing,
        this,
      );
    }
    return this;
  }
  isOwner(user: AuthUser): boolean {
    return this.customer_id === user.id || this.fliiinker_id === user.id;
  }
  toDto(): OrderDto {
    return {
      id: this.id,
      created_at: this.created_at,
      start_date: this.start_date,
      end_date: this.end_date,
      status: this.status,
      service_id: this.service_id,
      customer_id: this.customer_id,
      fliiinker_id: this.fliiinker_id,
      channel_id: this.channel_id,
      events: this.events,
    } as OrderDto;
  }

  private containsAnyEvent(...eventNames: Array<EOrderEventName>): boolean {
    return eventNames.some((eventName) =>
      this._events.some((event) => event.name === eventName),
    );
  }

  public userCanDoAction(
    userRole: 'customer' | 'fliiinker',
    newEventName: EOrderEventName,
  ): boolean {
    const currentEventsArray = this.events.map((e) => e.name);

    if (userRole === 'customer')
      return (
        Order.CUSTOMER_ALLOWED_ACTIONS.includes(newEventName) &&
        !currentEventsArray.includes(newEventName)
      );
    if (userRole === 'fliiinker') {
      return (
        Order.FLIIINKER_ALLOWED_ACTIONS.includes(newEventName) &&
        !currentEventsArray.includes(newEventName)
      );
    }
    return false;
  }

  public addEvent(eventName: EOrderEventName): Order {
    const event = {
      created_at: new Date().toISOString(),
      name: eventName,
    } as IOrderEvent;
    this.events.push(event);

    this._updateStatus();

    return this;
  }

  private _updateStatus(): void {
    switch (this.lastEvent.name) {
      case EOrderEventName.CONFIRM_PAYMENT:
        this.status = EOrderStatus.PAYMENT_CONFIRMED;
        break;
      case EOrderEventName.FLIIINKER_ON_THE_WAY:
        this.status = EOrderStatus.FLIIINKER_ON_THE_WAY;
        break;
      case EOrderEventName.FLIIINKER_START_SERVICE:
        this.status = EOrderStatus.SERVICE_STARTED;
        break;
      case EOrderEventName.CUSTOMER_CONFIRM_START_SERVICE:
        this.status = EOrderStatus.SERVICE_START_CONFIRMED;
        break;
      case EOrderEventName.CUSTOMER_COMPLETE_SERVICE_BEFORE_DUE_DATE:
        this.status = EOrderStatus.SERVICE_COMPLETED_BEFORE_DUE_DATE;
        break;
      case EOrderEventName.FLIIINKER_COMPLETE_SERVICE:
        this.status = EOrderStatus.SERVICE_COMPLETED;
        break;
      case EOrderEventName.CUSTOMER_CANCEL:
        this.status = EOrderStatus.CANCELLED;
        break;
    }
  }

  private _emitEvent() {
    let recipients = [];

    switch (this.status) {
      case EOrderStatus.PAYMENT_CONFIRMED: // TODO: cérifier si il faut envoyer un event dans ce cas precis
        recipients = [this.fliiinker_id];
        break;
      case EOrderStatus.AWAITING_START:
        recipients = [this.customer_id, this.fliiinker_id];
        break;
      case EOrderStatus.FLIIINKER_ON_THE_WAY:
      case EOrderStatus.SERVICE_STARTED:
      case EOrderStatus.SERVICE_COMPLETED:
        recipients = [this.customer_id];
        break;
      case EOrderStatus.SERVICE_START_CONFIRMED:
      case EOrderStatus.SERVICE_COMPLETED_BEFORE_DUE_DATE:
      case EOrderStatus.CANCELLED:
        recipients = [this.fliiinker_id];
        break;
    }
    this.eventEmitter.emit('order-event', {
      orderDto: this.toDto(),
      orderNotificationData: {
        last_event_name: this.lastEvent.name,
        recipients,
        customer: this.customer,
        fliiinker: this.fliiinker,
      } as IOrderNotificationData,
    });
  }

  /* #region getters and setters */

  public get id(): number {
    return this._id;
  }
  public set id(value: number) {
    this._id = value;
  }

  public get created_at(): Date | string {
    return this._created_at;
  }
  public set created_at(value: Date | string) {
    this._created_at = value;
  }

  public get start_date(): Date | string {
    return this._start_date;
  }
  public set start_date(value: Date | string) {
    this._start_date = value;
  }

  public get end_date(): Date | string {
    return this._end_date;
  }
  public set end_date(value: Date | string) {
    this._end_date = value;
  }

  public get status(): string {
    return this._status;
  }
  public set status(value: string) {
    this._status = value;
  }

  public get service_id(): number {
    return this._service_id;
  }
  public set service_id(value: number) {
    this._service_id = value;
  }

  public get customer_id(): string {
    return this._customer_id;
  }
  public set customer_id(value: string) {
    this._customer_id = value;
  }

  public get fliiinker_id(): string {
    return this._fliiinker_id;
  }
  public set fliiinker_id(value: string) {
    this._fliiinker_id = value;
  }

  public get channel_id(): number {
    return this._channel_id;
  }
  public set channel_id(value: number) {
    this._channel_id = value;
  }

  public get events(): Array<any> {
    return this._events;
  }
  public set events(value: Array<any>) {
    this._events = value;
  }

  public get lastEvent(): IOrderEvent {
    return this._events[this._events.length - 1];
  }

  public get billing(): Billing {
    return this._billing;
  }
  public set billing(value: Billing) {
    this._billing = value;
  }
  public get performer_id(): string {
    return this._performer_id;
  }
  public set performer_id(value: string) {
    this._performer_id = value;
  }

  public get customer(): any {
    return this._customer;
  }
  public set customer(value: any) {
    this._customer = value;
  }

  public get fliiinker(): any {
    return this._fliiinker;
  }
  public set fliiinker(value: any) {
    this._fliiinker = value;
  }

  /* #endregion */
}

export interface IOrderNotificationData {
  recipients: Array<string>;
  last_event_name: string;
  customer: any;
  fliiinker: any;
}
