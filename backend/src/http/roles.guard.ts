import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import {
  Reflector,
} from '@nestjs/core';

import type {
  UserRole,
} from '../data/user/user.entity';

import {
  ROLES_KEY,
} from './roles.decorator';

type AuthenticatedRequest = {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
};

@Injectable()
export class RolesGuard
  implements CanActivate {
  constructor(
    private readonly reflector:
      Reflector,// đọc thông tin đã ghi lên API
  ) {}

  canActivate(
    context: ExecutionContext,
  ) {
    const requiredRoles =
      this.reflector
        .getAllAndOverride<
          UserRole[]
        >(
          ROLES_KEY,
          [
            context.getHandler(),
            context.getClass(),
          ],
        );

    if (!requiredRoles?.length) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<
          AuthenticatedRequest
        >();

    const user =
      request.user;

    if (
      !user
      || !requiredRoles.includes(
        user.role,
      )
    ) {
      throw new ForbiddenException(
        'FORBIDDEN',
      );
    }

    return true;
  }
}