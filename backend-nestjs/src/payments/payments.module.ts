import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { OrdersModule } from 'src/orders/orders.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    SupabaseModule,
    StripeModule,
    CreditCardsModule,
    OrdersModule,
    UsersModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
