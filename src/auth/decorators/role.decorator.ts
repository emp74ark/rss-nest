import { Role } from '../../shared/enums';
import { Reflector } from '@nestjs/core';

/**
 * Add a role to the endpoint that can be used in the RoleGuard
 * @param role
 * @constructor
 */
export const RequiredRole = Reflector.createDecorator<Role>();
