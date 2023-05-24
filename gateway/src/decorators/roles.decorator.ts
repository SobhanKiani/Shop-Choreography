import { SetMetadata } from '@nestjs/common';
import { ROLE_ENUM } from '@sobhankiani/shopc-common-lib';


export const ROLES_KEY = 'roles';
export const Roles = (...roles: ROLE_ENUM[]) => SetMetadata(ROLES_KEY, roles);
