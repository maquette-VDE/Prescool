import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role/role-service';
import { map } from 'rxjs';
import { UserRole } from '../models/userRole';

export const instructorGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const roleService = inject(RoleService);

  return roleService.getRole$().pipe(
    map(role => {
      console.log("role: ", role);
      if (role === UserRole.INSTRUCTEUR || role === UserRole.ADMIN || role === UserRole.ENCADRANT) {
        return true; //accès autorisé
      } else if (role === UserRole.CONSULTANT || role === UserRole.ETUDIANT || role === UserRole.VISITEUR) {
        return router.parseUrl('/sidenav/instructor'); //redirection
      }
      return false;
    })
  )
};
