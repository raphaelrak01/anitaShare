import {
  AbstractSupabaseResource,
  SupabaseUserType,
} from 'src/supabase/abstract-supabase-resource.model';
import { CreateChatMessageDto } from '../dtos/create-chat-message.dto';
import { ChatChannel } from 'src/chat-channel/models/chat-channel.model';
import { ChatMessageDto } from '../dtos/chat-message.dto';
import { AuthUser } from '@supabase/supabase-js';

export class ChatMessage extends AbstractSupabaseResource {
  // in table
  private _id: number;
  private _created_at: Date | string;
  private _message: string;
  private _sender_id: string;
  private _channel_id: number;

  // extra data (not in table)
  private _channel: ChatChannel;

  get(params: {
    user: SupabaseUserType;
    resourceId: string | number;
  }): Promise<AbstractSupabaseResource> {
    throw new Error('Method not implemented.');
  }
  create(
    data: CreateChatMessageDto & {
      channel?: ChatChannel;
      channel_id: number;
      sender_id: string;
    },
  ): AbstractSupabaseResource {
    const { message, channel, channel_id, sender_id } = data;
    this.channel = channel;
    this.channel_id = channel_id;
    this.message = message;
    this.sender_id = sender_id;

    return this;
  }
  async save(): Promise<AbstractSupabaseResource> {
    if (!this.id) {
      const { data, error } = await this.supabase
        .getClient()
        .from('message_chat')
        .insert({
          message: this.message,
          channel_id: this.channel_id,
          sender_id: this.sender_id,
        })
        .select()
        .single();

      if (data) this.eventEmitter.emit('chat.message.created', this.toDto());
    }

    return this;
  }

  mapData(data: any): ChatMessage {
    const { id, created_at, message, channel_id, sender_id } = data;
    this.id = id;
    this.created_at = created_at;
    this.message = message;
    this.channel_id = channel_id;
    this.sender_id = sender_id;

    return this;
  }

  isOwner(user: AuthUser): boolean {
    throw new Error('Method not implemented.');
  }
  toDto(): ChatMessageDto {
    return {
      id: this.id,
      created_at: this.created_at,
      message: this.message,
      sender_id: this.sender_id,
      channel_id: this.channel_id,
      other_users_in_channel: this.channel.users_ids.filter(
        (id) => id !== this.sender_id,
      ),
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

  public get message(): string {
    return this._message;
  }
  public set message(value: string) {
    this._message = value;
  }
  public get sender_id(): string {
    return this._sender_id;
  }
  public set sender_id(value: string) {
    this._sender_id = value;
  }

  public get channel_id(): number {
    return this._channel_id;
  }
  public set channel_id(value: number) {
    this._channel_id = value;
  }

  public get channel(): ChatChannel {
    return this._channel;
  }
  public set channel(value: ChatChannel) {
    this._channel = value;
  }

  /* #endregion */
}
