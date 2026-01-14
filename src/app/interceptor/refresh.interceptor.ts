import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { AuthService } from "../services/auth.service";
import { ApiConfigService } from "../services/api-config.service";
import { switchMap } from 'rxjs/operators';



@Injectable()

export class RefreshInterceptor implements HttpInterceptor { 
   
    constructor( 
        private authService: AuthService,
        private apiConfig: ApiConfigService,
        private http: HttpClient
    ) {}
   
    intercept(req: HttpRequest<any>, next: HttpHandler) {

        // Pas de token → on laisse passer
        if (!this.authService.getToken()) {
          if (!this.authService.getRefreshToken()) {
            return next.handle(req);
          }
        }
      
        // Si refresh token présent → vérifier
        if (this.authService.getRefreshToken()) {
          return this.http.post<any>(this.apiConfig.buildUrl('auth/verify'), '')
            .pipe(
              switchMap(response => {
                if (response) {
                  // Token valide → continuer normalement
                  return next.handle(req);
                } else {
                  // Token expiré → refresh
                  return this.http.post<any>(this.apiConfig.buildUrl('auth/refresh'), '')
                    .pipe(
                      switchMap((refreshResponse) => {
                        const newReq = req.clone({
                          setHeaders: {
                            Authorization: `Bearer ${refreshResponse.token}`
                          }
                        });
                        return next.handle(newReq);
                      })
                    );
                }
              })
            );
        }
      
        // Ne pas intercepter la génération du token
        if (req.url.indexOf('auth/token') !== -1) {
            return next.handle(req);
          }          
      
        // Ajouter le token
        const authReq = req.clone({
          setHeaders: {
            Accept: 'application/json',
            Authorization: `Bearer ${this.authService.getToken()}`
          }
        });
      
        return next.handle(authReq);
      }
      
}