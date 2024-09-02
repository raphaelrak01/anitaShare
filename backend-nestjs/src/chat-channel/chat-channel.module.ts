import { Module } from '@nestjs/common';
import { ChatChannelService } from './chat-channel.service';
import { ChatChannelController } from './chat-channel.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [ChatChannelService],
  controllers: [ChatChannelController],
})
export class ChatChannelModule {}
