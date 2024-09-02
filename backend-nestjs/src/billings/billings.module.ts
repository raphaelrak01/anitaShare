import { forwardRef, Module } from '@nestjs/common';
import { BillingsService } from './billings.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { QueuesModule } from 'src/queues/queues.module';

@Module({
  imports: [SupabaseModule, forwardRef(() => QueuesModule)],
  providers: [BillingsService],
  exports: [BillingsService],
})
export class BillingsModule {}
