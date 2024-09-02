import { AuthUser } from '@supabase/supabase-js';

export interface IEnrichedAuthUser extends AuthUser {
  // user: AuthUser;
  public_profile: any;
  user_stripe_data: any;
}
