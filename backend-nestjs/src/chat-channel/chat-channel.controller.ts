import { Body, Controller, Post } from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import { CreateChatChannelDto } from './dtos/create-chat-channel.dto';
import { ChatChannelService } from './chat-channel.service';
import { ApiTags } from '@nestjs/swagger';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

@ApiTags('Chat Channel')
@Controller('channel')
export class ChatChannelController {
  constructor(private readonly channelService: ChatChannelService) {}

  @Post()
  @SupabaseGuard()
  @Serialize()
  async createChatChannel(
    @CurrentUser() user: AuthUser,
    @Body() createChannelDto: CreateChatChannelDto,
  ): Promise<any> {
    return this.channelService.createChannel(user, createChannelDto);
  }
}
