import { Module } from '@nestjs/common';
import { StripeCustomersService } from './stripe-customers.service';
import { StripeCustomersController } from './stripe-customers.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [SupabaseModule, StripeModule],
  providers: [StripeCustomersService],
  controllers: [StripeCustomersController],
})
export class StripeCustomersModule {}
