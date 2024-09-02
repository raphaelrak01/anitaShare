import { SetMetadata } from '@nestjs/common';

interface ClassConstructor {
  new (...args: any[]): object;
}

export interface IGetSupabaseResourceDecoratorParams {
  resourceId: string;
  resourceClass: ClassConstructor;
  // subResourceId?: string;
  allowAdmins?: boolean;
}

export const RESOURCE_KEY = 'resources';
export const GetSupabaseResources = (
  ...resources: Array<IGetSupabaseResourceDecoratorParams>
) => SetMetadata(RESOURCE_KEY, resources);
