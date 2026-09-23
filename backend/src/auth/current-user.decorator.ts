import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../users/user.schema';

export interface JwtUser {
  sub: string;
  email: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtUser => {
  return ctx.switchToHttp().getRequest().user;
});
