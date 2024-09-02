import { Module } from '@nestjs/common';
import { FliinkerStepsService } from './fliiinker-steps.service';
import { FliinkerStepsController } from './fliiinker-steps.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [FliinkerStepsController],
  providers: [FliinkerStepsService],
  imports: [SupabaseModule, UsersModule],
})
export class FliinkerStepsModule {}
