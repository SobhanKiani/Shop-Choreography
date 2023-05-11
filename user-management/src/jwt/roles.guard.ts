import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'decorators/roles.decorator';
import { JwtPayload } from 'jsonwebtoken';
import { UserService } from 'services/user-services/user.service';
import { ROLE_ENUM } from 'utils/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE_ENUM[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest() as JwtPayload;
    const userEntity = await this.userService.getUserById(user.id)
    const userRoles = userEntity.getRolesStringList();

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
