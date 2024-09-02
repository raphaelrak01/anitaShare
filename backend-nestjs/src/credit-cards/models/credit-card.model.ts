import { InternalServerErrorException } from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import { isEmptyObject } from 'src/common/helpers/validation.helpers';
import { IEnrichedAuthUser } from 'src/common/interfaces/encriched-auth-user.interface';
import {
  AbstractSupabaseResource,
  ISupabaseGetResourceParams,
  SupabaseUserType,
} from 'src/supabase/abstract-supabase-resource.model';

export class CreditCard extends AbstractSupabaseResource {
  private _id: number;
  // ...
  private _stripe_id: string;

  private created_at: Date | string;
  private name: string;
  private brand: string;
  private last_digits: string;
  private exp_month: number;
  private exp_year: number;
  private stripe_customer_id: string;

  async get(params: ISupabaseGetResourceParams): Promise<CreditCard> {
    const { resourceId: creditCardId, user } = params;

    const { data, error } = await this.supabase
      .getClient(user)
      .from('stripe_card')
      .select('*')
      .eq('id', creditCardId)
      .single();

    if (!isEmptyObject(error)) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }

    if (data) {
      this.mapData(data);
    }

    return this;
  }
  create(data: any): CreditCard {
    throw new Error('Method not implemented.');
  }
  save(user?: SupabaseUserType): Promise<CreditCard> {
    throw new Error('Method not implemented.');
  }
  mapData(data: any): CreditCard {
    this.id = data.id;
    this.created_at = data.created_at;
    this.name = data.name;
    this.brand = data.brand;
    this.last_digits = data.last_digits;
    this.exp_month = data.exp_month;
    this.exp_year = data.exp_year;
    this.stripe_customer_id = data.stripe_customer_id;
    this.stripe_id = data.stripe_id;

    return this;
  }
  isOwner(user: IEnrichedAuthUser): boolean {
    const { user_stripe_data } = user;
    return this.stripe_customer_id === user_stripe_data.id;
  }
  toDto() {
    throw new Error('Method not implemented.');
  }

  public get id(): number {
    return this._id;
  }
  public set id(value: number) {
    this._id = value;
  }

  public get stripe_id(): string {
    return this._stripe_id;
  }
  public set stripe_id(value: string) {
    this._stripe_id = value;
  }
}
