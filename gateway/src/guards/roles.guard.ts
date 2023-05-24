import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.get<string[]>(
            'roles',
            context.getHandler(),
        );

        if (!requiredRoles) {
            return true;
        } else {
            const user = context.switchToHttp().getRequest().user
            if (!user.roles) {
                return false;
            }

            const haveAllTheRoels = requiredRoles.every((role) =>
                user.roles.includes(role),
            );
            return haveAllTheRoels ? true : false;
        }
    }
}
