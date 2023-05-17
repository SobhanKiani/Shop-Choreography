import { SetMetadata } from '@nestjs/common';
import { Role } from 'entities/value-objects';


export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
