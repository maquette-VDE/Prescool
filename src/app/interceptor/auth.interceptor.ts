import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { AuthService } from "../services/auth/auth.service";


@Injectable()

export class AuthInterceptor implements HttpInterceptor { 
   
    constructor( private authService: AuthService, private http: HttpClient ) {}
   
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        
        if (req.url.includes('auth/token') || req.url.includes('auth/refresh')) {
            return next.handle(req);
        }

        const token = this.authService.getToken();

        if (token && this.isTokenExpiringSoon(token)) {
            return this.refreshAndRetry(req, next);
        }
        const authReq = this.addToken(req, token);

        return next.handle(authReq);
    }

    addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
        if (!token) {
            return req;
        }
        return req.clone({
            setHeaders: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
    }
    

    isTokenExpiringSoon(token: string): boolean {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = exp - currentTime;
        return timeLeft < 60;
    }

    private refreshAndRetry(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authService.refreshToken().pipe(
        switchMap((newToken) => {
            const clonedReq = this.addToken(req, newToken.accessToken);
            return next.handle(clonedReq);
        }),
        catchError((error) => {
            this.http.post('auth/logout', {}).subscribe();
            return throwError(() => error);
        })  );
  
    } 
     
}