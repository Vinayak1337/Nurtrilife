import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the verified Clerk userId from the request.
 * Populated by ClerkAuthGuard after JWT verification.
 *
 * Usage: @CurrentUser() userId: string
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.userId;
  },
);
