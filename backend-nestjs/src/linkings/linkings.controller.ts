import {
  Body,
  Controller,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { LinkingsService } from './linkings.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import { AuthUser } from '@supabase/supabase-js';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateLinkingDto } from './dtos/update-linking.dto';
import { SupabaseResource } from 'src/common/decorators/supabase-resource.decorator';
import { Linking } from './models/linking.model';
import {
  GetSupabaseResources,
  IGetSupabaseResourceDecoratorParams,
} from 'src/common/decorators/get-supabase-resource.decorator';
import { SupabaseResourceGuard } from 'src/common/guards/supabase-resource.guard';
import { Research } from 'src/research/models/research.model';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

@ApiTags('Linkings')
@Controller('research/:searchId/linkings')
export class LinkingsController {
  constructor(private readonly linkingsService: LinkingsService) {}

  @Patch(':id')
  @ApiOperation({
    summary: 'Update linking status',
    description: `Update linking status according to actions taken by customer or fliiinker, then notify other party of changes <br><br> 
    - Actions allowed for customer :  [ ${Object.values(Linking.CUSTOMER_ALLOWED_ACTIONS).map((e) => ` <strong>${e}</strong> `)} ].<br> 
    - Actions allowed for a fliiinker : [ ${Object.values(Linking.FLIIINKER_ALLOWED_ACTIONS).map((e) => ` <strong>${e}</strong> `)} ]`,
  })
  @ApiResponse({
    status: 200,
    description:
      'The linking has been successfully updated and other party has been notified.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The linking id',
    required: true,
  })
  @ApiParam({
    name: 'searchId',
    type: String,
    description: 'The research id',
    required: true,
  })
  @SupabaseGuard()
  @UseGuards(SupabaseResourceGuard)
  @GetSupabaseResources({
    resourceId: 'searchId',
    resourceClass: Research,
    linkingId: 'id',
  } as IGetSupabaseResourceDecoratorParams) // TODO créer les interface qui extends de celle ci
  @Serialize()
  async updateLinking(
    @CurrentUser() user: AuthUser,
    @Body() updateLinkingDto: UpdateLinkingDto,
    @SupabaseResource('searchId')
    research: Research,
  ) {
    if (!research) {
      throw new NotFoundException('Research not found');
    }
    return this.linkingsService.updateLinking(user, research, updateLinkingDto);
  }
}
