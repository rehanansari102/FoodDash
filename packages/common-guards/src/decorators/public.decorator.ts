import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublicEndpoint';

/**
 * Marks a route as reachable from the public internet, bypassing InternalAuthGuard.
 * Only for endpoints that authenticate themselves some other way — health probes,
 * or webhooks that verify a provider signature.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
