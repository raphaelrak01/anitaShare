import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESOURCE_KEY } from '../decorators/get-supabase-resource.decorator';
import { Supabase } from 'src/supabase/supabase';
import { ISupabaseGetResourceParams } from 'src/supabase/abstract-supabase-resource.model';

@Injectable()
export class SupabaseResourceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private supabase: Supabase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourcesToRetrieve = this.reflector.getAllAndOverride<Array<any>>(
      RESOURCE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!resourcesToRetrieve) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const resources = {} as ISupabaseGetResourceParams;

    await Promise.all(
      resourcesToRetrieve.map(async (resource) => {
        const mappedResourceParams = {
          resourceId: '',
          user: 'owner',
        } as ISupabaseGetResourceParams;

        //TODO: améliorer ceci
        Object.entries(resource).forEach(([key, value]) => {
          if (key !== 'resourceClass')
            mappedResourceParams[key] =
              request?.params[value as string] ??
              request?.body[value as string];
        });

        const instance = await this.supabase
          .getSupabaseResource(resource.resourceClass)
          .get(mappedResourceParams);

        resources[resource.resourceId] = instance;
        return instance;
      }),
    );
    request.resources = resources;

    // TODO: checkIsOwner for each resources
    return true;
  }
}
