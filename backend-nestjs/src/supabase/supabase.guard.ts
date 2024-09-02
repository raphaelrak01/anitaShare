import { Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  // ApiHeader,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Injectable()
export class _SupabaseGuard extends AuthGuard('jwt') {}

export function SupabaseGuard() {
  return applyDecorators(
    UseGuards(_SupabaseGuard),
    // ApiHeader({ name: 'Refresh', description: 'Refresh token' }),
    ApiBearerAuth('JWT'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
