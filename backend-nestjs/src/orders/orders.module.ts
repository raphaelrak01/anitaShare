import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { OrdersController } from './orders.controller';

@Module({
  imports: [SupabaseModule],
  providers: [OrdersService],
  exports: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
