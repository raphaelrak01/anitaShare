import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import { Profile } from 'src/common/decorators/profile.decorator';
import { IEnrichedAuthUser } from 'src/common/interfaces/encriched-auth-user.interface';
import { Supabase } from 'src/supabase/supabase';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(private readonly supabase: Supabase) {}

  async getPublicProfile(uuid: string) {
    const { data: publicProfile, error } = await this.supabase
      .getClient('owner')
      .from('public_profile')
      .select('*')
      .eq('id', uuid)
      .single();
    if (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }

    return publicProfile;
  }

  @Profile()
  async enrichUserData(user: AuthUser): Promise<IEnrichedAuthUser> {
    const { data: completeProfile, error } = await this.supabase
      .getClient('owner')
      .from('public_profile')
      .select('*, stripe_data :stripe_customer(*)')
      .eq('id', user.id)

      .single();
    if (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }

    const { stripe_data, ...public_profile } = completeProfile;

    // TODO: throw error if stripe data is not found

    // if (!stripe_data ) {
    //   console.error('Stripe data not found for user', user.id);
    //   //throw new InternalServerErrorException('Stripe data not found for user');
    // }

    // TODO: ajouter fliiinker_profile ?

    return {
      ...user,
      public_profile,
      user_stripe_data: stripe_data,
    } as IEnrichedAuthUser;
  }
}
