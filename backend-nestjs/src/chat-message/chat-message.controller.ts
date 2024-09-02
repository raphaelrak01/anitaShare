import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import { ChatMessageService } from './chat-message.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUser } from '@supabase/supabase-js';
import { CreateChatMessageDto } from './dtos/create-chat-message.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { SupabaseResourceGuard } from 'src/common/guards/supabase-resource.guard';
import { GetSupabaseResources } from 'src/common/decorators/get-supabase-resource.decorator';
import { ChatChannel } from 'src/chat-channel/models/chat-channel.model';
import { SupabaseResource } from 'src/common/decorators/supabase-resource.decorator';

@Controller('channel/:channel_id/chat-message')
@ApiTags('Chat Message')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @Post()
  @SupabaseGuard()
  @UseGuards(SupabaseResourceGuard)
  @GetSupabaseResources({
    resourceId: 'channel_id',
    resourceClass: ChatChannel,
  })
  @ApiParam({
    name: 'channel_id',
    type: Number,
    description: 'The channel id',
    required: true,
  })
  @Serialize()
  async createChatMessage(
    @CurrentUser() user: AuthUser,
    @Body() createChatMessageDto: CreateChatMessageDto,
    @SupabaseResource('channel_id') channel: ChatChannel,
  ): Promise<any> {
    return this.chatMessageService.createChatMessage(
      user,
      channel,
      createChatMessageDto,
    );
  }
}
