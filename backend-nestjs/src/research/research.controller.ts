import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@supabase/supabase-js';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dtos/create-research.dto';
import { ResearchDto } from './dtos/research.dto';
// import { Serialize } from 'src/common/interceptors/serialize.interceptor';

@ApiTags('Research')
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @SupabaseGuard()
  // @Serialize()
  async createResearch(
    @CurrentUser() user: AuthUser,
    @Body() createResearchDto: CreateResearchDto,
  ): Promise<ResearchDto> {
    return this.researchService.createResearchWithLinkings(
      user,
      createResearchDto,
    );
  }
}
