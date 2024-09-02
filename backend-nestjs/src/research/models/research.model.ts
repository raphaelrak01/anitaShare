import { Linking } from 'src/linkings/models/linking.model';
import { AbstractSupabaseResource } from 'src/supabase/abstract-supabase-resource.model';
import { InternalServerErrorException } from '@nestjs/common';
import { ResearchDto } from '../dtos/research.dto';
import { Profile } from 'src/common/decorators/profile.decorator';
import { dataContainsObjectsWithKey } from 'src/common/helpers/validation.helpers';
import { AuthUser } from '@supabase/supabase-js';

export class Research extends AbstractSupabaseResource {
  private _id: number;
  private _created_at: Date | string;
  private _service_id: number;
  private _service_start: string;
  private _service_end: string;
  private _service_duration: number;
  private _customer_latitude: number;
  private _customer_longitude: number;
  private _customer_city: string;
  private _search_details: any; //TODO: typer ceci
  private _customer_id: string;
  private _linkings: Array<Linking>;
  private _linkings_number: number;
  private _is_active: boolean;

  private _confirmed_fliiinker_id: string | null;
  private _confirmed_linking_id: number | null;
  private _status: string;

  @Profile()
  async get(params: {
    resourceId: string | number;
    linkingId?: number;
    user: 'admin' | 'owner' | 'stripe';
  }): Promise<Research> {
    const { resourceId: searchId, linkingId, user } = params;
    let query = this.supabase
      .getClient(user)
      .from('search')
      // .select('*, linkings: linking(*)')
      .select(
        '*, linkings: linking(*, customer: public_profile!public_linking_customer_id_fkey(id, email, first_name, last_name), fliiinker: public_profile!public_linking_fliiinker_id_fkey(id, email, first_name, last_name))',
      )
      .eq('id', searchId);
    if (linkingId) {
      query = query.eq('linking.id', linkingId);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error(error);
      throw new InternalServerErrorException({
        supabaseError: error,
      });
    }
    if (data) {
      this.mapData(data);
    }
    return this;
  }
  isOwner(user: AuthUser): boolean {
    throw new Error('Method not implemented.');
  }

  @Profile()
  mapData(data: any): Research {
    this.id = data.id;
    this.created_at = data.created_at;
    this.service_id = data.service_id;
    this.search_details = data.search_details;
    this.customer_id = data.customer_id;
    this.linkings_number = data.linkings_number;
    this.customer_latitude = data.customer_latitude;
    this.customer_longitude = data.customer_longitude;
    this.customer_city = data.customer_city;
    this.service_start = data.service_start;
    this.service_end = data.service_end;
    this.service_duration = data.service_duration;
    this.is_active = data.is_active;
    this.confirmed_fliiinker_id = data.confirmed_fliiinker_id;
    this.confirmed_linking_id = data.confirmed_linking_id;
    this.status = data.status;
    this.linkings = data.linkings?.map((e) => {
      return new Linking(this.supabase, this.eventEmitter).mapData(e, this);
    });

    return this;
  }

  create(data: any): Research {
    throw new Error('Method not implemented.');
  }

  @Profile()
  async save(): Promise<Research> {
    if (!this.id) {
      const { data, error } = await this.supabase
        .getClient()
        .from('search')
        .insert({
          service_id: this.service_id,
          search_details: JSON.parse(this.search_details),
          customer_id: this.customer_id,
          linkings_number: this.linkings_number,
          customer_city: this.customer_city,
          service_start: this.service_start,
          service_end: this.service_end,
          service_duration: this.service_duration,
        })
        .select()
        .single();

      if (data) {
        this.mapData(data);
      }

      if (error) {
        console.error({ supabaseError: error });
        throw new InternalServerErrorException({
          supabaseError: error,
        });
      }
    } else {
      const { data, error } = await this.supabase
        .getClient()
        .from('search')
        .update({
          is_active: this.is_active,
          confirmed_fliiinker_id: this.confirmed_fliiinker_id,
          confirmed_linking_id: this.confirmed_linking_id,
          status: this.status,
        })
        .eq('id', this.id)
        .select()
        .single();
    }

    return this;
  }

  @Profile()
  public toDto(): ResearchDto {
    return {
      id: this.id,
      service_id: this.service_id,
      service_start: this.service_start,
      service_end: this.service_end,
      service_duration: this.service_duration,
      customer_id: this.customer_id,
      search_details: this.search_details,
      linkings_number: this.linkings_number,
      linkings: this.linkings?.map((linking: Linking) => linking.toDto()),
    };
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

  public get service_id(): number {
    return this._service_id;
  }
  public set service_id(value: number) {
    this._service_id = value;
  }

  public get service_start(): string {
    return this._service_start;
  }
  public set service_start(value: string) {
    // TODO: check if valid date
    this._service_start = value;
  }

  public get service_end(): string {
    return this._service_end;
  }
  public set service_end(value: string) {
    // TODO: check if valid date
    this._service_end = value;
  }

  public get service_duration(): number {
    return this._service_duration;
  }
  public set service_duration(value: number) {
    this._service_duration = value;
  }

  public get customer_latitude(): number {
    return this._customer_latitude;
  }
  public set customer_latitude(value: number) {
    this._customer_latitude = value;
  }

  public get customer_longitude(): number {
    return this._customer_longitude;
  }
  public set customer_longitude(value: number) {
    this._customer_longitude = value;
  }

  public get customer_city(): string {
    return this._customer_city;
  }
  public set customer_city(value: string) {
    this._customer_city = value;
  }

  public get linkings(): Array<Linking> {
    return this._linkings;
  }
  public set linkings(value: Array<Linking>) {
    this._linkings = value;
  }

  public get search_details(): any {
    return this._search_details;
  }
  public set search_details(value: any) {
    this._search_details = value;
  }

  public get linkings_number(): number {
    return this._linkings_number;
  }
  public set linkings_number(value: number) {
    this._linkings_number = value;
  }

  public get customer_id(): string {
    return this._customer_id;
  }
  public set customer_id(value: string) {
    this._customer_id = value;
  }

  public get is_active(): boolean {
    return this._is_active;
  }
  public set is_active(value: boolean) {
    this._is_active = value;
  }

  public get confirmed_fliiinker_id(): string | null {
    return this._confirmed_fliiinker_id;
  }
  public set confirmed_fliiinker_id(value: string | null) {
    this._confirmed_fliiinker_id = value;
  }

  public get confirmed_linking_id(): number | null {
    return this._confirmed_linking_id;
  }
  public set confirmed_linking_id(value: number | null) {
    this._confirmed_linking_id = value;
  }

  public get status(): string {
    return this._status;
  }
  public set status(value: string) {
    this._status = value;
  }

  /* #endregion */
}
