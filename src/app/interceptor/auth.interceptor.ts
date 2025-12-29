import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";


@Injectable()

export class AuthInterceptor implements HttpInterceptor { 
   
    constructor( private authService: AuthService ) {}
   
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const token = this.authService.getToken();

        if (!token) {
            return next.handle(req);
        }

        if (req.url.includes('auth/token')) {
            return next.handle(req);
        }
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        return next.handle(authReq);
    }
}