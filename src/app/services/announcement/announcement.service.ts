import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private http = inject(HttpClient);
  private apiUrl = 'https://prez-cool-staging.appsolutions224.com/docs#/';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token'); 
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAnnonces(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getAnnonceById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}`, { headers: this.getHeaders() });
  }
}