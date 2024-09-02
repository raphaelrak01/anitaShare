import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  UseInterceptors,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';

export function EnrichCurrentUser() {
  return UseInterceptors(EnrichCurrentUserInterceptor);
}

@Injectable()
export class EnrichCurrentUserInterceptor implements NestInterceptor {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    request.user = await this.usersService.enrichUserData(user);
    return next.handle();
  }
}
