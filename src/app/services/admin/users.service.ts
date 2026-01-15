import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiConfigService } from '../api-config.service';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  getListOfPendingUsers(): Observable<any> {
    const params = new HttpParams().set('is_active', 'false');
    return this.http.get<any>(this.apiConfig.buildUrl('users'), { params }).pipe();
  }
}
