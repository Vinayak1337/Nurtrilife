import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public — skips ClerkAuthGuard JWT verification.
 * Use only on endpoints that genuinely need no authentication (e.g. health check).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
