import {
  AbstractSupabaseResource,
  SupabaseUserType,
} from 'src/supabase/abstract-supabase-resource.model';
import { ELinkingStatus } from '../enums/linking-status.enum';
import { LinkingEvent } from './linking-event.model';
import { ELinkingEventName } from '../enums/linking-event-name.enum';
import { LinkingDto } from '../dtos/linking.dto';
import {
  isEmptyObject,
  objectHasKey,
} from 'src/common/helpers/validation.helpers';
import { Research } from 'src/research/models/research.model';
import { InternalServerErrorException } from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';

export class Linking extends AbstractSupabaseResource {
  public static readonly CUSTOMER_ALLOWED_ACTIONS = [
    ELinkingEventName.CUSTOMER_LIKE,
    ELinkingEventName.CUSTOMER_CONFIRM,
  ];
  public static readonly FLIIINKER_ALLOWED_ACTIONS = [
    ELinkingEventName.FLIIINKER_ACCEPT,
    ELinkingEventName.FLIIINKER_REFUSE,
  ];

  private readonly EVENTS_PROHIBIT_NEW_ACTION_FOR_CUSTOMER = [
    ELinkingEventName.FLIIINKER_ABORT,
    ELinkingEventName.FLIIINKER_RELAUNCH,
    ELinkingEventName.IS_FLIIINK,
  ];

  private readonly EVENTS_PROHIBIT_NEW_ACTION_FOR_FLIIINKER = [
    ELinkingEventName.FLIIINKER_ACCEPT,
    ELinkingEventName.FLIIINKER_ABORT,
    ELinkingEventName.CUSTOMER_CONFIRM,
    ELinkingEventName.IS_PRE_FLIIINK,
    ELinkingEventName.IS_FLIIINK,
  ];

  // in table
  private _id: number;
  private _created_at: Date | string;
  private _updated_at: Date | string;
  private _search_id: number;
  private _status: ELinkingStatus;
  private _customer_id: string;
  private _fliiinker_id: string;
  private _dist_meters: number;
  private _fliiinker_name: string;
  private _fliiinker_rating: number;
  private _fliiinker_is_validated: boolean;
  private _fliiinker_is_pro: boolean;
  private _fliiinker_avatar: string;
  private _total_price: number;
  private _service_duration: number;
  private _fliiinker_service_hourly_rate: number;
  private _events: Array<LinkingEvent>;

  // extra data (not in table)
  private _performer_id: string;

  private _customer?: any;
  private _fliiinker?: any;
  private _research?: Research;
  private _rpc_finalize_linking_results: any;

  async get(params: {
    user: SupabaseUserType;
    resourceId: string | number;
  }): Promise<Linking> {
    const { resourceId: linkingId } = params;
    const { data, error } = await this.supabase
      .getClient()
      .from('linking')
      .select('*')
      .eq('id', linkingId)
      .single();
    //TODO: gérer les erreurs
    if (error) {
      console.error(error);
    }

    if (data) {
      this.mapData(data);
    }

    return this;
  }
  isOwner(user: AuthUser): boolean {
    throw new Error('Method not implemented.');
  }

  mapData(data: any, research?: Research): Linking {
    if (objectHasKey(data, 'linking_id')) {
      this.id = data.linking_id;
      this._created_at = data.linking_created_at;
      this.updated_at = data.linking_updated_at;
      this.status = data.linking_status;
      this.search_id = data.linking_search_id;
      this.customer_id = data.linking_customer_id;
      this.fliiinker_id = data.linking_fliiinker_id;
      this.dist_meters = data.linking_dist_meters;
      this.fliiinker_name = data.linking_fliiinker_name;
      this.fliiinker_rating = data.linking_fliiinker_rating;
      this.fliiinker_is_validated = data.linking_fliiinker_is_validated;
      this.fliiinker_is_pro = data.linking_fliiinker_is_pro;
      this.fliiinker_avatar = data.linking_fliiinker_avatar;
      this.total_price = data.linking_total_price;
      this.service_duration = data.linking_service_duration;
      this.fliiinker_service_hourly_rate =
        data.linking_fliiinker_service_hourly_rate;
      this.events = data.linking_events;
    } else {
      this.id = data.id;
      this._created_at = data.created_at;
      this.updated_at = data.updated_at;
      this.status = data.status;
      this.search_id = data.search_id;
      this.customer_id = data.customer_id;
      this.fliiinker_id = data.fliiinker_id;
      this.customer = data.customer ?? this.customer;
      this.fliiinker = data.fliiinker ?? this.fliiinker;
      this.events = data.events;
    }
    if (research) {
      this.research = research;
    }

    return this;
  }

  public addEvent(eventName: ELinkingEventName): Linking {
    const event = {
      created_at: new Date().toISOString(),
      name: eventName,
    } as LinkingEvent;
    this.events.push(event);

    this._updateStatus();

    return this;
  }

  private containsAnyEvent(...eventNames: Array<ELinkingEventName>): boolean {
    return eventNames.some((eventName) =>
      this._events.some((event) => event.name === eventName),
    );
  }

  public userCanDoAction(
    userRole: 'customer' | 'fliiinker',
    newEventName: ELinkingEventName,
  ): boolean {
    const currentEventsArray = this.events.map((e) => e.name);

    if (userRole === 'customer')
      return (
        Linking.CUSTOMER_ALLOWED_ACTIONS.includes(newEventName) &&
        !this.containsAnyEvent(
          ...this.EVENTS_PROHIBIT_NEW_ACTION_FOR_CUSTOMER,
        ) &&
        !currentEventsArray.includes(newEventName)
      );
    if (
      userRole === 'fliiinker' &&
      newEventName !== ELinkingEventName.FLIIINKER_REFUSE &&
      !currentEventsArray.includes(newEventName)
    )
      return (
        !this.containsAnyEvent(
          ...this.EVENTS_PROHIBIT_NEW_ACTION_FOR_FLIIINKER,
        ) && Linking.FLIIINKER_ALLOWED_ACTIONS.includes(newEventName)
      );
    if (
      userRole === 'fliiinker' &&
      newEventName === ELinkingEventName.FLIIINKER_REFUSE
    )
      return (
        !this.containsAnyEvent(
          ...this.EVENTS_PROHIBIT_NEW_ACTION_FOR_FLIIINKER,
        ) &&
        Linking.FLIIINKER_ALLOWED_ACTIONS.includes(newEventName) &&
        currentEventsArray.reduce((acc, value) => {
          return value === ELinkingEventName.FLIIINKER_REFUSE ? acc + 1 : acc;
        }, 0) <= 1
      );
    return false;
  }

  private _updateStatus(): void {
    switch (this.lastEvent.name) {
      case ELinkingEventName.CUSTOMER_LIKE:
        this.status = ELinkingStatus.CUSTOMER_LIKED;
        break;
      case ELinkingEventName.CUSTOMER_CONFIRM:
        this.status = ELinkingStatus.CUSTOMER_CONFIRMED;
        break;
      case ELinkingEventName.FLIIINKER_ACCEPT:
        this.status = ELinkingStatus.FLIIINKER_ACCEPTED;
        break;
      case ELinkingEventName.FLIIINKER_REFUSE:
        this.status = ELinkingStatus.FLIIINKER_REFUSED;
        break;
      case ELinkingEventName.FLIIINKER_RELAUNCH:
        this.status = ELinkingStatus.FLIIINKER_RELAUNCHED;
        break;
      case ELinkingEventName.FLIIINKER_ABORT:
        this.status = ELinkingStatus.FLIIINKER_ABORTED;
        break;
      case ELinkingEventName.IS_PRE_FLIIINK:
        this.status = ELinkingStatus.IS_PRE_FLIIINK;
        break;
      case ELinkingEventName.IS_FLIIINK:
        this.status = ELinkingStatus.IS_FLIIINK;
        break;
    }
  }

  create(data: any): Linking {
    throw new Error('Method not implemented.');
  }

  public async save(): Promise<Linking> {
    if (this.lastEvent.name === ELinkingEventName.IS_FLIIINK)
      return this.callFinalizeLinkingRPC();
    const { data, error } = await this.supabase
      .getClient()
      .from('linking')
      .update({
        status: this._status,
        events: JSON.parse(JSON.stringify(this.events)),
      })
      .eq('id', this._id)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }

    if (data) {
      this.mapData(data);
      this._emitEvent();
    }

    return this;
  }

  private _emitEvent() {
    this.eventEmitter.emit('linking-event', {
      linkingDto: this.toDto(),
      linkingNotificationData: {
        last_event_name: this.lastEvent.name,
        performer_id: this.performer_id,
        customer: this.customer,
        fliiinker: this.fliiinker,
      } as ILinkingNotificationData,
    });
  }

  private async callFinalizeLinkingRPC() {
    const { data, error } = await this.supabase
      .getClient()
      .rpc('finalize_linking', {
        linking_id: this.id,
      });

    if (!isEmptyObject(data)) {
      this.rpc_finalize_linking_results = data;

      this.mapData(data.linking);
      this._emitEvent();
    }

    if (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }

    return this;
  }

  public toDto(): LinkingDto {
    return {
      id: this._id,
      created_at: this.created_at,
      updated_at: this.updated_at,
      status: this.status,
      search_id: this.search_id,
      customer_id: this.customer_id,
      fliiinker_id: this.fliiinker_id,
      dist_meters: this.dist_meters,
      fliiinker_name: this.fliiinker_name,
      fliiinker_is_pro: this.fliiinker_is_pro,
      fliiinker_is_validated: this.fliiinker_is_validated,
      fliiinker_rating: this.fliiinker_rating,
      fliiinker_service_hourly_rate: this.fliiinker_service_hourly_rate,
      fliiinker_avatar: this.fliiinker_avatar,
      total_price: this.total_price,
      service_duration: this.service_duration,
      events: this.events,
      order_id: this.rpc_finalize_linking_results?.order?.id,
    } as LinkingDto;
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
  public set create_at(value: Date | string) {
    this._created_at = value;
  }

  public get updated_at(): Date | string {
    return this._updated_at;
  }
  public set updated_at(value: Date | string) {
    this._updated_at = value;
  }

  public get search_id(): number {
    return this._search_id;
  }
  public set search_id(value: number) {
    this._search_id = value;
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

  public get dist_meters(): number {
    return this._dist_meters;
  }
  public set dist_meters(value: number) {
    this._dist_meters = value;
  }

  public get fliiinker_name(): string {
    return this._fliiinker_name;
  }
  public set fliiinker_name(value: string) {
    this._fliiinker_name = value;
  }

  public get fliiinker_rating(): number {
    return this._fliiinker_rating;
  }
  public set fliiinker_rating(value: number) {
    this._fliiinker_rating = value;
  }

  public get fliiinker_is_validated(): boolean {
    return this._fliiinker_is_validated;
  }
  public set fliiinker_is_validated(value: boolean) {
    this._fliiinker_is_validated = value;
  }

  public get fliiinker_is_pro(): boolean {
    return this._fliiinker_is_pro;
  }
  public set fliiinker_is_pro(value: boolean) {
    this._fliiinker_is_pro = value;
  }

  public get fliiinker_avatar(): string {
    return this._fliiinker_avatar;
  }
  public set fliiinker_avatar(value: string) {
    this._fliiinker_avatar = value;
  }

  public get total_price(): number {
    return this._total_price;
  }
  public set total_price(value: number) {
    this._total_price = value;
  }

  public get service_duration(): number {
    return this._service_duration;
  }
  public set service_duration(value: number) {
    this._service_duration = value;
  }

  public get fliiinker_service_hourly_rate(): number {
    return this._fliiinker_service_hourly_rate;
  }
  public set fliiinker_service_hourly_rate(value: number) {
    this._fliiinker_service_hourly_rate = value;
  }

  public get status(): ELinkingStatus {
    return this._status;
  }
  public set status(value: ELinkingStatus) {
    this._status = value;
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

  public get events(): Array<LinkingEvent> {
    return this._events;
  }

  public set events(value: Array<LinkingEvent>) {
    this._events = value;
  }

  public get lastEvent(): LinkingEvent {
    return this._events[this._events.length - 1];
  }

  public get rpc_finalize_linking_results(): any {
    return this._rpc_finalize_linking_results;
  }
  public set rpc_finalize_linking_results(value: any) {
    this._rpc_finalize_linking_results = value;
  }

  public get performer_id(): string {
    return this._performer_id;
  }
  public set performer_id(value: string) {
    this._performer_id = value;
  }

  public get research(): Research {
    return this._research;
  }
  public set research(value: Research) {
    this._research = value;
  }

  /* #endregion */
}

// TODO: à déplacer
export interface ILinkingNotificationData {
  performer_id: string;
  last_event_name: string;
  customer: any;
  fliiinker: any;
}
