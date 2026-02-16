import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role/role-service';
import { map, take } from 'rxjs';
import { UserRole } from '../models/userRole';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const roleService = inject(RoleService);

  return roleService.getRole$().pipe(
    take(1),
    map(role => {
      console.log("role: ", role);
      if (role === UserRole.CONSULTANT) {
        return true; //accès autorisé
      }
      else if(role === UserRole.INSTRUCTEUR) {
        return router.parseUrl('/sidenav/planning'); //redirection
      }
      return false;
    })
  );
};
