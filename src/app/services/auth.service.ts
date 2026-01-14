import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiConfigService } from "./api-config.service";
import { tap } from "rxjs";
import { HttpHeaders, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'//enregistre à la racine de l'application
})

export class AuthService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}
  
  login(code: string, password: string, scope: string = 'read write') {

    const body = { code, password, scope };

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
    return this.http.post<any>(this.apiConfig.buildUrl('auth/token'),
      body,{ headers }
    ).pipe(
      tap(response => {
        console.log('Access Token:', response.access_token);
        console.log('Refresh Token:', response.refresh_token);
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      })
    ); 
  }
  getToken(): string {
    return localStorage.getItem('access_token') || '';
  }

  getRefreshToken(): string {
    return localStorage.getItem('refresh_token') || '';
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.clear();
  }
}