import { InternalServerErrorException } from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import { orderByCreatedAt } from 'src/common/helpers/cast.helpers';
import { Order } from 'src/orders/models/order.model';
import { AbstractSupabaseResource } from 'src/supabase/abstract-supabase-resource.model';
import Stripe from 'stripe';

export class Billing extends AbstractSupabaseResource {
  private _id: string;
  private _created_at: Date | string;
  private _total_amount: number;
  private _fees: number;
  private _fliiinker_rate: number;
  private _order_id: number;
  private _payment_status: string;
  private _payment_events: Array<any>; // TODO: typer events

  private _order: Order;

  async get(params: {
    resourceId: string | number;
    orderId?: number;
    user: string;
  }): Promise<Billing> {
    const { resourceId: billingId, orderId } = params;

    let query = this.supabase.getClient('stripe').from('billing').select('*');
    if (billingId) {
      query = query.eq('id', billingId);
    }
    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data, error } = await query.single();
    if (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }

    if (data) {
      this.mapData(data);
    }

    return this;
  }
  create(data: any): Billing {
    throw new Error('Method not implemented.');
  }

  public addEvent(stripeEvent: Stripe.Event): Billing {
    const eventData = stripeEvent.data.object as Stripe.Subscription;

    const event = {
      event_id: stripeEvent.id,
      event_created_at: new Date(stripeEvent.created * 1000).toISOString(),
      type: stripeEvent.type,
      data: {
        object: eventData.object,
        id: eventData.id,
      },
      metadata: eventData.metadata,
    };
    this.payment_events.push(event);
    this.payment_events = orderByCreatedAt(this.payment_events);

    this.payment_status = this.lastPaymentEvent.type;

    return this;
  }

  async save(): Promise<Billing> {
    const { data, error } = await this.supabase
      .getClient('stripe')
      .from('billing')
      .update({
        payment_status: this.payment_status,
        payment_events: JSON.parse(JSON.stringify(this.payment_events)),
      })
      .eq('id', this.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }

    if (data) {
      this.mapData(data);
    }

    return this;
  }
  mapData(data: any, order?: Order): Billing {
    this.id = data.id;
    this.created_at = data.created_at;
    this.total_amount = data.total_amount;
    this.fees = data.fees;
    this.fliiinker_rate = data.fliiinker_rate;
    this.order_id = data.order_id;
    this.payment_status = data.payment_status;
    this.payment_events = data.payment_events;

    if (order) {
      this.order = order;
    }

    return this;
  }
  isOwner(user: AuthUser): boolean {
    throw new Error('Method not implemented.');
  }
  toDto() {
    throw new Error('Method not implemented.');
  }

  /* #region getters and setters */

  public get lastPaymentEvent(): any {
    return this.payment_events[this.payment_events.length - 1];
  }

  public get id(): string {
    return this._id;
  }
  public set id(value: string) {
    this._id = value;
  }

  public get created_at(): Date | string {
    return this._created_at;
  }
  public set created_at(value: Date | string) {
    this._created_at = value;
  }

  public get total_amount(): number {
    return this._total_amount;
  }
  public set total_amount(value: number) {
    this._total_amount = value;
  }

  public get fees(): number {
    return this._fees;
  }
  public set fees(value: number) {
    this._fees = value;
  }

  public get fliiinker_rate(): number {
    return this._fliiinker_rate;
  }
  public set fliiinker_rate(value: number) {
    this._fliiinker_rate = value;
  }

  public get order_id(): number {
    return this._order_id;
  }
  public set order_id(value: number) {
    this._order_id = value;
  }

  public get payment_status(): string {
    return this._payment_status;
  }
  public set payment_status(value: string) {
    this._payment_status = value;
  }

  public get payment_events(): Array<any> {
    return this._payment_events;
  }
  public set payment_events(value: Array<any>) {
    this._payment_events = value;
  }

  public get order(): Order {
    return this._order;
  }
  public set order(value: Order) {
    this._order = value;
  }

  /* #endregion */
}
