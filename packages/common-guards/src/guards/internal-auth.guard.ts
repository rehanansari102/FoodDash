import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { timingSafeEqual } from 'crypto';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { INTERNAL_SECRET_HEADER } from '../internal-headers';

/**
 * Rejects HTTP traffic that did not come from the API gateway or a sibling service.
 *
 * The downstream services trust gateway-injected identity headers (x-user-id,
 * x-user-role), so anything able to reach them directly could forge an admin
 * identity. Behind Docker's internal network that was unreachable; on a host that
 * gives every service a public URL it is not, and this guard restores the boundary.
 */
@Injectable()
export class InternalAuthGuard implements CanActivate {
  private readonly logger = new Logger(InternalAuthGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // WebSocket handshakes verify their own JWT in OrderGateway.handleConnection,
    // and browsers cannot be given the shared secret. HTTP only.
    if (context.getType() !== 'http') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const expected = process.env.INTERNAL_API_SECRET;
    if (!expected) {
      // Fail closed in production rather than silently serving an open service.
      if (process.env.NODE_ENV === 'production') {
        this.logger.error(
          'INTERNAL_API_SECRET is not set — refusing all internal traffic',
        );
        throw new ServiceUnavailableException();
      }
      return true;
    }

    const provided = context.switchToHttp().getRequest()
      .headers?.[INTERNAL_SECRET_HEADER];

    if (typeof provided !== 'string' || !safeEqual(provided, expected)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch, so compare lengths first. Length
  // is not the secret here, only its contents.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
