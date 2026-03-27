import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api-config.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://prez-cool-staging.appsolutions224.com/api/v1/users';
  private readonly apiConfig = inject(ApiConfigService);
  getUserMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateUserMe(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, userData);
  }

updateUserPassword(identifier: any, passwordData: any): Observable<any> {
  // On construit l'URL exactement comme le Swagger le montre
  // Assure-toi que identifier n'est pas 0 (on a vu 64 dans tes logs, c'est bon)
  const url = this.apiConfig.buildUrl(`users/${identifier}/password`);

  console.log("🚀 URL ENVOYÉE :", url);
  return this.http.put(url, passwordData);
}
}
