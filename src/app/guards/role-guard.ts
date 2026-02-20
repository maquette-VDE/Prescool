import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role/role.servcice';
import { map, take } from 'rxjs';
import { UserRole } from '../models/userRole';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const roleService = inject(RoleService);

  
  return roleService.getRole().pipe(
    take(1),
    map(role => {
      console.log("role: ", role);
      if (role?.includes(UserRole.CONSULTANT)||role?.includes(UserRole.ETUDIANT)|| role?.includes(UserRole.ADMIN)) {
        return true; //accès autorisé
      }
      else if(role?.includes(UserRole.INSTRUCTEUR) || role?.includes(UserRole.ENCADRANT)|| role?.includes(UserRole.ADMIN)){ 
        return router.parseUrl('/sidenav/planning'); //redirection
      }
      return false;
    })
  );
};
