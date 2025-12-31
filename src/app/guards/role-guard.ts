import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role/role-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const roleService = inject(RoleService);
  let roles = roleService.getRole();
  let isConsultant: boolean = roles?.includes('consultant') || false;
  let isExpert: boolean = roles?.includes('expert') || false;

  if(isConsultant) {
    return true;
  }
  else if(isExpert) {
     return router.parseUrl('/sidenav/planning');
  }

  return false;
};
