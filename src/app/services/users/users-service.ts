import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UsersApiResponse } from '../../interfaces/userItem';
import { UserRole } from '../../models/userRole';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);

  getUsers(url: string): Observable<UsersApiResponse> {
    return this.http
      .get<any>(url)
      .pipe(map((response) => response as UsersApiResponse));
  }

  getUsersByAttendanceStatus(
    status: 'present' | 'absent' | 'late',
  ): Observable<UsersApiResponse> {
    const now = new Date();

    const startOfDayUtc = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    const endOfDayUtc = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    let params = new HttpParams()
      .set('attendance_status', status)
      .set('event_start_from', startOfDayUtc.toISOString())
      .set('event_start_to', endOfDayUtc.toISOString())
      .set('limit', '100')
      .set('page', '0')
      .append('role_names', UserRole.CONSULTANT)
      .append('role_names', UserRole.ETUDIANT);

    return this.http.get<UsersApiResponse>(`${environment.apiBaseUrl}users`, {
      params,
    });
  }

  getUsersByAttendanceStatusForRange(
    status: 'present' | 'absent' | 'late',
    start: Date,
    end: Date,
  ): Observable<UsersApiResponse> {
    let params = new HttpParams()
      .set('attendance_status', status)
      .set('event_start_from', start.toISOString())
      .set('event_start_to', end.toISOString())
      .set('limit', '100')
      .set('page', '0')
      .append('role_names', UserRole.CONSULTANT)
      .append('role_names', UserRole.ETUDIANT);

    return this.http.get<UsersApiResponse>(`${environment.apiBaseUrl}users`, {
      params,
    });
  }

  getConsultantsAndStudents(): Observable<UsersApiResponse> {
    let params = new HttpParams()
      .set('limit', '100')
      .set('page', '0')
      .append('role_names', UserRole.CONSULTANT)
      .append('role_names', UserRole.ETUDIANT);

    return this.http.get<UsersApiResponse>(`${environment.apiBaseUrl}users`, {
      params,
    });
  }

  normalize(str: string) {
    return str
      .replace(/^"+|"+$/g, '') // supprimer guillemets au début et à la fin
      .normalize('NFD') // séparer les accents
      .replace(/[\u0300-\u036f]/g, '') // enlever accents
      .replace(/[\u200B-\u200F]/g, '') // enlever caractères invisibles
      .trim() // enlever espaces
      .toLowerCase(); // insensible à la casse
  }
}
