import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { map } from 'rxjs';
import { UserRole } from '../models/userRole';
import { RoleService } from '../services/role/role-service';

export const instructorGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const roleService = inject(RoleService);

return roleService.getRole().pipe(
  map((roles: UserRole[] | null) => {

    if (!roles) {
      return router.parseUrl('/sidenav/instructor');
    }

    if (
      roles.includes(UserRole.INSTRUCTEUR) ||
      roles.includes(UserRole.ADMIN) ||
      roles.includes(UserRole.ENCADRANT)
    ) {
      return true;
    }

    return router.parseUrl('/sidenav/instructor');
  })
);
};
