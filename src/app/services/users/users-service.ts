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

    const eventStartFrom = encodeURIComponent(startOfDayUtc.toISOString());
    const eventStartTo = encodeURIComponent(endOfDayUtc.toISOString());

    const url =
      `https://prez-cool-staging.appsolutions224.com/api/v1/users` +
      `?role_names=${UserRole.CONSULTANT}` +
      `&role_names=${UserRole.ETUDIANT}` +
      `&attendance_status=${status}` +
      `&event_start_from=${eventStartFrom}` +
      `&event_start_to=${eventStartTo}` +
      `&limit=100&page=0`;

    return this.getUsers(url);
  }

  getUsersByAttendanceStatusForRange(
    status: 'present' | 'absent' | 'late',
    start: Date,
    end: Date,
  ): Observable<UsersApiResponse> {
    const eventStartFrom = encodeURIComponent(start.toISOString());
    const eventStartTo = encodeURIComponent(end.toISOString());

    const url =
      `https://prez-cool-staging.appsolutions224.com/api/v1/users` +
      `?role_names=${UserRole.CONSULTANT}` +
      `&role_names=${UserRole.ETUDIANT}` +
      `&attendance_status=${status}` +
      `&event_start_from=${eventStartFrom}` +
      `&event_start_to=${eventStartTo}` +
      `&limit=100&page=0`;

    return this.getUsers(url);
  }

  getConsultantsAndStudents(): Observable<UsersApiResponse> {
    const url =
      `https://prez-cool-staging.appsolutions224.com/api/v1/users` +
      `?role_names=${UserRole.CONSULTANT}` +
      `&role_names=${UserRole.ETUDIANT}` +
      `&limit=100&page=0`;

    return this.getUsers(url);
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
