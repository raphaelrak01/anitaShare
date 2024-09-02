import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseGuard } from './supabase.guard';
import { EnrichCurrentUser } from 'src/common/interceptors/enriched-current-user.interceptor';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUser } from '@supabase/supabase-js';
import { Supabase } from './supabase';
import { CredentialsDto } from './dtos/credentials.dto';

@ApiTags('Auth')
@Controller('supabase')
export class SupabaseController {
  constructor(private readonly supabase: Supabase) {}
  @Get('me')
  @ApiOperation({
    summary: 'Logged in user info',
    description: 'Returns the complete information of the logged in user',
  })
  @SupabaseGuard()
  @EnrichCurrentUser()
  whoAmI(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Get('sign-in')
  @ApiOperation({
    summary: '[ Test ] Sign In',
    description:
      'Sign in with email and password. This endpoint is only available on test environments',
  })
  async signIn(@Query() credentials: CredentialsDto) {
    const { data, error } = await this.supabase
      .getClient('stripe') // TODO: supprimer cette methode
      .auth.signInWithPassword(credentials);

    if (error) {
      console.error(error);
    }

    return { access_token: data.session.access_token };
  }
}
