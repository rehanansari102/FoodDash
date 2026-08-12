export const INTERNAL_SECRET_HEADER = 'x-internal-secret';

/**
 * Builds headers for a service-to-service HTTP call, attaching the shared secret
 * that InternalAuthGuard checks on the receiving end.
 *
 * When INTERNAL_API_SECRET is unset the secret is simply omitted — the guard is
 * also inert without it, which keeps local development working unconfigured.
 */
export function internalHeaders(
  extra: Record<string, string> = {},
): Record<string, string> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return { ...extra };
  return { ...extra, [INTERNAL_SECRET_HEADER]: secret };
}
