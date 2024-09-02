import { Module, Global } from '@nestjs/common';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Global()
@Module({
  imports: [SupabaseModule],
  providers: [],
  exports: [],
})
export class CommonModule {}
