import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { environment } from './common/environment';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { SupabaseModule } from './supabase/supabase.module';
import { StripeModule } from './stripe/stripe.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { StripeCustomersModule } from './stripe-customers/stripe-customers.module';
import { NotifyModule } from './notify/notify.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BillingsModule } from './billings/billings.module';
import { ResearchModule } from './research/research.module';
import { LinkingsModule } from './linkings/linkings.module';
import { HealthModule } from './health/health.module';
import { ProfilingMiddleware } from './common/middlewares/profiling.middleware';
import { QueuesModule } from './queues/queues.module';
import { ChatMessageModule } from './chat-message/chat-message.module';
import { ChatChannelModule } from './chat-channel/chat-channel.module';
import { FliinkerStepsModule } from './fliiinker-steps/fliiinker-steps.module';
import { AvatarUploadModule } from './avatar-upload/avatar-upload.module';
import { FliiinkerProfileImageModule } from './fliiinker-profile-image/fliiinker-profile-image.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      load: [environment],
    }),

    CommonModule,
    PassportModule,
    EventEmitterModule.forRoot(),
    SupabaseModule,
    StripeModule,
    CreditCardsModule,
    StripeCustomersModule,
    NotifyModule,
    UsersModule,
    PaymentsModule,
    OrdersModule,
    BillingsModule,
    ResearchModule,
    LinkingsModule,
    HealthModule,
    QueuesModule,
    ChatChannelModule,
    ChatMessageModule,
    FliinkerStepsModule,
    AvatarUploadModule,
    FliiinkerProfileImageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProfilingMiddleware).forRoutes('*');
  }
}
