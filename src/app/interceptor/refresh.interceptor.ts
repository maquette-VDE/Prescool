import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { AuthService } from "../services/auth.service";
import { ApiConfigService } from "../services/api-config.service";


@Injectable()

export class RefreshInterceptor implements HttpInterceptor { 
   
    constructor( 
        private authService: AuthService,
        private apiConfig: ApiConfigService,
        private http: HttpClient
    ) {}
   
    intercept(req: HttpRequest<any>, next: HttpHandler) {

        if (!this.authService.getToken()) {
            if(!this.authService.getRefreshToken()){
                return next.handle(req);
            }
        }

        if(this.authService.getRefreshToken()){
            this.http.post<any>(this.apiConfig.buildUrl('auth/verify'),''
                ).pipe( 
                    tap(response => { 
                        if(response){
                            return next.handle(req);
                        }
                        else{
                            this.http.post<any>(this.apiConfig.buildUrl('auth/refresh'),'').pipe();
                            return next.handle(req);
                        }
                    })
                );
        }

        if (req.url.includes('auth/token')) {
            return next.handle(req);
        }
        const authReq = req.clone({
            setHeaders: {
                Accept: 'application/json',
                Authorization: `Bearer ${this.authService.getToken()}`
            }
        });

        return next.handle(authReq);
    }
}