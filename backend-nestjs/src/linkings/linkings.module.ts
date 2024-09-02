import { Module } from '@nestjs/common';
import { LinkingsService } from './linkings.service';
import { LinkingsController } from './linkings.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { UsersModule } from 'src/users/users.module';
import { NotifyModule } from 'src/notify/notify.module';

@Module({
  imports: [SupabaseModule, UsersModule, NotifyModule],
  providers: [LinkingsService],
  controllers: [LinkingsController],
  exports: [LinkingsService],
})
export class LinkingsModule {}
