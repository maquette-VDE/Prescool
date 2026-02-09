import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiConfigService } from "../api-config.service";
import { map, Observable, tap } from "rxjs";
import { HttpHeaders, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  private router = inject(Router);

  login(username: string, password: string) {

    const body = new HttpParams()
    .set('grant_type', 'password')
    .set('username', username)
    .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });
    return this.http.post<any>(this.apiConfig.buildUrl('auth/token'),
      body.toString(),{ headers }
    ).pipe(
      tap(response => {
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
}
