import { EventEmitter2 } from '@nestjs/event-emitter';
import { Supabase } from './supabase';
import { AuthUser } from '@supabase/supabase-js';

export abstract class AbstractSupabaseResource {
  constructor(
    protected readonly supabase: Supabase,
    protected readonly eventEmitter: EventEmitter2,
  ) {}
  // abstract get(
  //   params?: ISupabaseGetResourceParams,
  //   ...ids: Array<string | number>
  // ): Promise<AbstractSupabaseResource>; // retrieve resource from supabase
  abstract get(
    params: ISupabaseGetResourceParams,
  ): Promise<AbstractSupabaseResource>; // retrieve resource from supabase
  abstract create(data): AbstractSupabaseResource; // create a new resource
  abstract save(user?: SupabaseUserType): Promise<AbstractSupabaseResource>; // save resource in supabase
  abstract mapData(data): AbstractSupabaseResource;
  abstract isOwner(user: AuthUser): boolean;
  abstract toDto();
}

export interface ISupabaseGetResourceParams {
  user: SupabaseUserType;
  resourceId: string | number;
}
export type SupabaseUserType = 'owner' | 'admin' | 'stripe';
