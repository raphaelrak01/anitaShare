import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [forwardRef(() => SupabaseModule)],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
