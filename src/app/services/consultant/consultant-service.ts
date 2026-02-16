import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UsersApiResponse } from '../../interfaces/userItem';
import { UserRole } from '../../models/userRole';

@Injectable({
  providedIn: 'root',
})
export class ConsultantService {
  private readonly http = inject(HttpClient);

  getConsultants(page: number, limit: number): Observable<UsersApiResponse> {
    return this.http
      .get<any>(
        `https://prez-cool-staging.appsolutions224.com/api/v1/users?role_names=${UserRole.CONSULTANT}&role_names=${UserRole.ETUDIANT}&limit=${limit}&page=${page}`,
      )
      .pipe(map((response) => response as UsersApiResponse));
  }
}
