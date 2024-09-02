import { Module } from '@nestjs/common';
import { ResearchService } from './research.service';
import { ResearchController } from './research.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { LinkingsModule } from 'src/linkings/linkings.module';

@Module({
  imports: [SupabaseModule, LinkingsModule],
  providers: [ResearchService],
  controllers: [ResearchController],
})
export class ResearchModule {}
