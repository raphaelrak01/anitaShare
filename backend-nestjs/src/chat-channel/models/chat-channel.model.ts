import { InternalServerErrorException } from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import {
  AbstractSupabaseResource,
  SupabaseUserType,
} from 'src/supabase/abstract-supabase-resource.model';

export class ChatChannel extends AbstractSupabaseResource {
  // in table
  private _id: number;
  private _created_at: Date | string;
  private _name: string;

  // extra data (not in table)
  private _users_ids: Array<string>;

  // async get(channelId: number): Promise<ChatChannel> {
  async get(params: {
    user: SupabaseUserType;
    resourceId: string | number;
  }): Promise<ChatChannel> {
    const { resourceId: channelId } = params;
    const { data, error } = await this.supabase
      .getClient()
      .from('channel')
      .select('*, users:channel_user_mtm(*)')
      .eq('id', channelId)
      .single();

    if (data) this.mapData(data);

    return this;
  }
  create(data: any): ChatChannel {
    const { name, users_ids } = data;
    this.name = name;
    this.users_ids = users_ids;

    return this;
  }

  mapData(data: IChatChannelRawData): ChatChannel {
    const { id, created_at, name, users } = data;
    this.id = id;
    this.created_at = created_at;
    this.name = name;
    this.users_ids = users.map((user) => user.user_id);

    return this;
  }
  async save(): Promise<ChatChannel> {
    if (!this.id) {
      const { data, error } = await this.supabase
        .getClient()
        .from('channel')
        .insert({
          name: this.name,
        })
        .select()
        .single();

      if (data) this.mapData(data);

      this.users_ids.forEach(async (userId) => {
        const { data: mtmData, error: mtmError } = await this.supabase
          .getClient()
          .from('channel_user_mtm')
          .insert({
            channel_id: this.id,
            user_id: userId,
          });
      });

      if (data) {
        this.mapData(data);
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
  isOwner(user: AuthUser): boolean {
    throw new Error('Method not implemented.');
  }
  toDto() {
    return {
      id: this.id,
      created_at: this.created_at,
      name: this.name,
      users_ids: this.users_ids,
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

  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }

  public get users_ids(): Array<string> {
    return this._users_ids;
  }
  public set users_ids(value: Array<string>) {
    this._users_ids = value;
  }
  /* #endregion */
}

export interface IChatChannelRawData {
  id: number;
  created_at: Date | string;
  name: string;
  users?: Array<{
    user_id: string;
    channel_id: number;
    created_at: Date | string;
  }>;
}
