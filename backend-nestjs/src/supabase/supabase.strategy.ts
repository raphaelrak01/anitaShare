import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import { environment } from 'src/common/environment';
import { Profile } from 'src/common/decorators/profile.decorator';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(SupabaseStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment().supabase.jwtSecret,
    });
  }

  @Profile()
  async validate(user: AuthUser) {
    user.id = user['sub'];
    return user;
  }
}
