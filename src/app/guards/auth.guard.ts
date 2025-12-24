import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject, Injectable } from '@angular/core';
/*
@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.auth.getToken()) {
      console.log('AuthGuard: accès autorisé : token :', this.auth.getToken());
      return true;
    } else {
      console.log('AuthGuard: accès refusé, redirection vers /auth/login');
      this.router.navigateByUrl('/auth/login');
      return false; 
    }
  }
}
*/
export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  //inject pour récupérer une instance de AuthService
  const router = inject(Router);

  if (auth.getToken()) {
    console.log('AuthGuard: accès autorisé : token :', auth.getToken());
    return true;
  } else {
    console.log('AuthGuard: accès refusé, redirection vers /auth/login');
    router.navigateByUrl('auth/login');
    return false;
  }
};
