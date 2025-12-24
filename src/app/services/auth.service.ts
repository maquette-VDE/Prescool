import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiConfigService } from "./api-config.service";
import { tap } from "rxjs";

@Injectable({
  providedIn: 'root'//enregistre à la racine de l'application
})

export class AuthService {
  private token !: string; 
  private refreshToken !: string;
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}
  
  login(username: string, password: string) {
    return this.http.post<any>(this.apiConfig.buildUrl('auth/login'),
      { username, password }
    ).pipe(
      tap(response => {
        this.token = response.access_token;
        this.refreshToken = response.refresh_token;
        //localStorage.setItem('access_token', response.access_token);
        //localStorage.setItem('refresh_token', response.refresh_token);
        
      })
    );
    
    
  }
  getToken(): string {
    return this.token;
    //return localStorage.getItem('access_token') || '';
  }

  /* logout() {
    this.token = '';
    this.refreshToken = '';
    localStorage.clear();
  } */
}