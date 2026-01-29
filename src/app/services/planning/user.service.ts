import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
 
  private readonly apiUrl = 'https://prez-cool-staging.appsolutions224.com/api/v1/users';

  getUserMe(): Observable<any> {
  let token = localStorage.getItem('access_token');
  
  // Cette ligne est CRUCIALE : elle enlève les guillemets s'ils existent
  if (token) {
    token = token.replace(/^"(.*)"$/, '$1'); 
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get(`${this.apiUrl}/me`, { headers });
}
 
  updateUserMe(userData: any): Observable<any> {
  // On nettoie le token pour éviter tout caractère invisible
  const token = localStorage.getItem('access_token')?.replace(/["']/g, '').trim();

  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // On retire 'Content-Type', Angular l'ajoutera tout seul s'il en a besoin
    })
  };

  return this.http.put(`${this.apiUrl}/me`, userData, httpOptions);
}
}