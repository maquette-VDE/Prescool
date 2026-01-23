import { Injectable, inject } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError, catchError, filter, take, switchMap } from "rxjs";
import { AuthService } from "../services/auth/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private authService = inject(AuthService);

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (this.isAuthRequest(req.url)) {
            return next.handle(req);
        }

        const token = this.authService.getToken();

        if (token && this.isTokenExpiringSoon(token)) {
            return this.handleRefreshToken(req, next);
        }

        return next.handle(this.addToken(req, token)).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    return this.handleRefreshToken(req, next);
                }
                return throwError(() => error);
            })
        );
    }

    private isAuthRequest(url: string): boolean {
        return url.includes('auth/token') || url.includes('auth/refresh');
    }

    private addToken(req: HttpRequest<any>, token: string | null): HttpRequest<any> {
        return token ? req.clone({
            setHeaders: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`
            }
        }) : req;
    }

    private isTokenExpiringSoon(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return (payload.exp - currentTime) < 60;
        } catch (e) {
            return true;
        }
    }

    private handleRefreshToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
                switchMap((response) => {
                    this.isRefreshing = false;
                    const newToken = response.accessToken;
                    this.refreshTokenSubject.next(newToken);
                    return next.handle(this.addToken(req, newToken));
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    this.authService.logout();
                    return throwError(() => err);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(token => next.handle(this.addToken(req, token)))
            );
        }
    }
}
