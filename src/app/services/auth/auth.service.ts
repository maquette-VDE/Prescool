import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiConfigService } from "../api-config.service";
import { map, Observable, tap } from "rxjs";
import { HttpHeaders, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'//enregistre à la racine de l'application
})

export class AuthService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}
  


  
  login(username: string, password: string) {

    const body = new HttpParams()
    .set('grant_type', 'password')   
    .set('username', username)
    .set('password', password);

  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  });
    console.log('Attempting login with username:', username);
    return this.http.post<any>(this.apiConfig.buildUrl('auth/token'),
      body.toString(),{ headers }
    ).pipe(
      tap(response => {
        console.log('Access Token:', response.access_token);
        console.log('Refresh Token:', response.refresh_token);
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      })
    );
    
    
  }
  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refresh_token');

    return this.http.post<{ accessToken: string }>('auth/refresh', 
      { refreshToken },
      { observe: 'response' }
    ).pipe(
      map(response => {
        const newAccessToken = response.body!.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        return response.body!;
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