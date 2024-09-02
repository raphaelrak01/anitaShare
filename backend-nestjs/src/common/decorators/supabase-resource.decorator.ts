import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SupabaseResource = createParamDecorator(
  async (id: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.resources[id];
  },
);
