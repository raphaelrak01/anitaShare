import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractSupabaseResource } from 'src/supabase/abstract-supabase-resource.model';
import { Profile } from '../decorators/profile.decorator';

interface ClassConstructor {
  new (...args: any[]): object;
}

export function Serialize(dto?: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly dto?: ClassConstructor) {}
  @Profile()
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof AbstractSupabaseResource) {
          return data.toDto();
        }

        if (isPaginated(data)) {
          data.data = plainToInstance(this.dto, data.data, {
            excludeExtraneousValues: true,
          });
          return data;
        }
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}

function isPaginated(data): boolean {
  if ('data' in data && 'meta' in data) {
    return true;
  }

  return false;
}
