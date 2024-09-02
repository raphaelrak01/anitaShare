import { Injectable } from '@nestjs/common';
import { Supabase } from 'src/supabase/supabase';
import { CreateChatChannelDto } from './dtos/create-chat-channel.dto';
import { ChatChannel } from './models/chat-channel.model';
import { AuthUser } from '@supabase/supabase-js';

@Injectable()
export class ChatChannelService {
  constructor(private readonly supabase: Supabase) {}

  async createChannel(
    currentUser: AuthUser,
    createChannelDto: CreateChatChannelDto,
  ) {
    const { users_ids } = createChannelDto;

    const channel = await this.supabase
      .getSupabaseResource(ChatChannel)
      .create({
        ...createChannelDto,
        users_ids: [...users_ids, currentUser.id],
      })
      .save();

    return channel;
  }
}
