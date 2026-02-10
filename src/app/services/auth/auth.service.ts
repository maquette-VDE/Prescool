import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiConfigService } from "../api-config.service";
import { map, Observable, tap, BehaviorSubject,switchMap } from "rxjs";
import { HttpHeaders, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) { this.loadUser();}

  private router = inject(Router);
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  

  // auth.service.ts

login(username: string, password: string) {
  const body = new HttpParams()
    .set('grant_type', 'password')
    .set('username', username)
    .set('password', password);

  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  });
 
  return this.http.post<any>(this.apiConfig.buildUrl('auth/token'), body.toString(), { headers })
    .pipe(
      tap(response => {
        // 1. Stockage des tokens pour que l'interceptor puisse fonctionner
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      }),
      // 2. On enchaîne avec l'appel pour récupérer le profil (rôles inclus)
      switchMap(() => this.http.get<any>(this.apiConfig.buildUrl('users/me'))),
      tap(user => {
        // 3. On stocke l'utilisateur complet et on informe le BehaviorSubject
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
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

  logout(): void {
    this.http.post(`${this.apiConfig.getBaseUrl}/users/me/logout`, {})
      .subscribe({
        next: () => this.clearStorageAndRedirect(),
        error: () => this.clearStorageAndRedirect()
      });
  }

  private clearStorageAndRedirect(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  loadUser() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }
}
