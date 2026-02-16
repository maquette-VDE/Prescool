import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DayPilot } from '@daypilot/daypilot-lite-angular';

import { UserEvent } from '../../interfaces/events';
import { UserItem } from '../../interfaces/userItem';
import { PaginatedResponse } from '../../interfaces/paginatedResponse';

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE = 'https://prez-cool-staging.appsolutions224.com/api/v1';


  getUsersDayPilotData(
    page = 0, limit = 4, startFrom?: string, startTo?: string,
    search?: string, status?: string, specialty?: string
  ): Observable<any> {
    return forkJoin({
      users: this.fetchUsers(search, status, specialty),
      events: this.fetchEvents(0, 100, startFrom, startTo)
    }).pipe(
      map(({ users, events }) => ({
        events: this.mapEvents(events.items),
        resources: this.mapResources(users.items, events.items),
        pagination: { total: users.total, pages: users.pages }
      }))
    );
  }


  private fetchUsers(search?: string, status?: string, code?: string): Observable<PaginatedResponse<UserItem>> {
    let params = new HttpParams().set('limit', '100').set('page', '0');
    if (search) params = params.set('first_name', search).set('last_name', search);
    if (status) params = params.set('status', status);
    if (code) params = params.set('code', code);

    return this.http.get<PaginatedResponse<UserItem>>(`${this.API_BASE}/users`, { params });
  }

  private fetchEvents(page: number, limit: number, from?: string, to?: string): Observable<PaginatedResponse<UserEvent>> {
    let params = new HttpParams().set('limit', limit.toString()).set('page', page.toString());
    if (from) params = params.set('start_from', from);
    if (to) params = params.set('start_to', to);

    return this.http.get<PaginatedResponse<UserEvent>>(`${this.API_BASE}/events`, { params });
  }

  getSpecialties(): Observable<any> {
    return this.http.get(`${this.API_BASE}/specialties`);
  }


  private mapEvents(events: UserEvent[]): DayPilot.EventData[] {
    return events.map(event => ({
      id: event.id ?? DayPilot.guid(),
      resource: event.user_id?.toString(),
      start: new DayPilot.Date(event.start_time),
      end: new DayPilot.Date(event.end_time),
      text: event.notes || event.title || '',
      tags: { type: event.attendance_status ?? 'present' }
    }));
  }

  private mapResources(users: UserItem[], events: UserEvent[]): DayPilot.ResourceData[] {
    const activeUserIds = new Set(events.map(e => e.user_id));

    return Array.from(activeUserIds).map(id => {
      const user = users.find(u => u.id === id);
      return {
        id: id?.toString() ?? '',
        name: user ? `${user.first_name}` : `Utilisateur ${id}`,
        tags: {
          code: user?.code ?? '',
          phone_number: user?.phone_number ?? ''
        }
      };
    });
  }
}
