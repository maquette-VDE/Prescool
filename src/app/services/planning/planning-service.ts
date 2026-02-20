import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DayPilot } from '@daypilot/daypilot-lite-angular';

import { UserEvent } from '../../interfaces/events';
import { UserItem } from '../../interfaces/userItem';
import { PaginatedResponse } from '../../interfaces/paginatedResponse';

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE =
    'https://prez-cool-staging.appsolutions224.com/api/v1';
  private readonly STUDENTS_AND_CONSULTANTS_ROLES = ['student', 'consultant'];

  getUsersDayPilotData(
    page = 0,
    limit = 10,
    startFrom?: string,
    startTo?: string,
    search?: string,
    status?: string,
    specialty?: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('page', page.toString());

    if (search) {
      params = params
        .set('first_name', search)
        .set('last_name', search)
        .set('code', search);
    }
    if (status) {
      params = params.set('event_type', 'presence');
      params = params.set('attendance_status', status);
      params = params.set('event_start_from', startFrom ?? '');
      params = params.set('event_end_to', startTo ?? '');
    }
    if (specialty) params = params.set('specialty_codes', specialty);

    this.STUDENTS_AND_CONSULTANTS_ROLES.forEach((role) => {
      params = params.append('role_names', role);
    });

    return forkJoin({
      users: this.fetchUsers(params),
      specialities: this.getSpecialties(),
    }).pipe(
      switchMap(({ users, specialities }) => {
        return this.fetchEvents(users.items, startFrom!, startTo!).pipe(
          map((events) => ({
            events: this.mapEvents(events.items),
            resources: this.mapResources(users.items),
            pagination: {
              total: users.total,
              pages: users.pages,
            },
            specialties: specialities.items,
          })),
        );
      }),
    );
  }

  private fetchUsers(
    params: HttpParams,
  ): Observable<PaginatedResponse<UserItem>> {
    return this.http.get<PaginatedResponse<UserItem>>(
      `${this.API_BASE}/users`,
      { params },
    );
  }

  private fetchEvents(
    users: UserItem[],
    from: string,
    to: string,
  ): Observable<PaginatedResponse<UserEvent>> {
    let params = new HttpParams();
    if (from) params = params.set('start_from', from);
    if (to) params = params.set('start_to', to);
    users.forEach((user) => {
      params = params.append('user_codes', user.code ?? '');
    });

    return this.http.get<PaginatedResponse<UserEvent>>(
      `${this.API_BASE}/events`,
      { params },
    );
  }

  getSpecialties(): Observable<any> {
    return this.http.get(`${this.API_BASE}/specialties?limit=20`);
  }

  private mapEvents(events: UserEvent[]): DayPilot.EventData[] {
    return events.map((event) => ({
      id: event.id ?? DayPilot.guid(),
      resource: event.user_id?.toString(),
      start: new DayPilot.Date(event.start_time),
      end: new DayPilot.Date(event.end_time),
      text: event.notes || event.title || '',
      tags: { type: event.attendance_status ?? 'present' },
    }));
  }

  private mapResources(
  users: UserItem[],
): DayPilot.ResourceData[] {
  return users.map((user) => {
    return {
      id: user.id?.toString() ?? '',
      name: `${user.first_name}`,
      tags: {
        code: user.code ?? '',
        phone_number: user.phone_number ?? '',
      },
    };
  });
}
}
