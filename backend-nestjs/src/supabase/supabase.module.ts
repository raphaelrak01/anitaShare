import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseStrategy } from './supabase.strategy';
import { _SupabaseGuard } from './supabase.guard';
import { Supabase } from './supabase';
import { SupabaseController } from './supabase.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ConfigModule, forwardRef(() => UsersModule)],
  providers: [Supabase, SupabaseStrategy, _SupabaseGuard],
  exports: [Supabase, SupabaseStrategy, _SupabaseGuard],
  controllers: [SupabaseController],
})
export class SupabaseModule {}
