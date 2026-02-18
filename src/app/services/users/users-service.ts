import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UsersApiResponse } from '../../interfaces/userItem';
import { UserRole } from '../../models/userRole';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);

  getUsers(url: string): Observable<UsersApiResponse> {
    return this.http
      .get<any>(
        url,
      )
      .pipe(map((response) => response as UsersApiResponse));
  }
}
