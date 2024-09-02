import { Injectable } from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import { Supabase } from 'src/supabase/supabase';
import { CreateChatMessageDto } from './dtos/create-chat-message.dto';
import { ChatMessage } from './models/chat-message.model';
import { ChatChannel } from 'src/chat-channel/models/chat-channel.model';

@Injectable()
export class ChatMessageService {
  constructor(private readonly supabase: Supabase) {}

  async createChatMessage(
    currentUser: AuthUser,
    channel: ChatChannel,
    createChatMessageDto: CreateChatMessageDto,
  ) {
    const chatMessage = await this.supabase
      .getSupabaseResource(ChatMessage)
      .create({
        ...createChatMessageDto,
        channel: channel,
        channel_id: channel.id,
        sender_id: currentUser.id,
      })
      .save();

    return chatMessage;
  }
}
