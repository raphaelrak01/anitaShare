import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { FliinkerStepsService } from './fliiinker-steps.service';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateStepDto } from './dtos/create-step.dto';
import { UpdateStepDto } from './dtos/update-step.dto';
import { SupabaseGuard } from 'src/supabase/supabase.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUser } from '@supabase/supabase-js';

@ApiTags('Fliinker Steps')
@Controller('fliinker-steps')
export class FliinkerStepsController {
  constructor(private readonly fliinkerStepsService: FliinkerStepsService) {}

  @Get()
  @ApiOperation({ summary: 'Get fliiinker status and steps' })
  @SupabaseGuard()
  @ApiResponse({ status: 200, description: 'Return all steps.' })
  async getFliiinkerSteps(@CurrentUser() currentUser: AuthUser) {
    return this.fliinkerStepsService.getFliiinkerInProgressSteps(currentUser);
  }
}
