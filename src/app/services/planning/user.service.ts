import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://prez-cool-staging.appsolutions224.com/api/v1/users';
  getUserMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateUserMe(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, userData);
  }
}