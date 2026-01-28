import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import {  map } from 'rxjs/operators';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { UserEvent } from '../../interfaces/events';
import { UserItem } from '../../interfaces/userItem';

@Injectable({
  providedIn: 'root',
})
export class PlanningService {
  private readonly http = inject(HttpClient);
  private users: UserItem[] = [];
  private events: UserEvent[] = [];


  getUsersDayPilotData(
    page: number = 0,
    limit: number = 4,
    startFrom?: string,
    startTo?: string
  ): Observable<{
    events: DayPilot.EventData[],
    resources: DayPilot.ResourceData[],
    pagination: { total: number, pages: number }
  }> {
    return forkJoin({
      users: this.getUsers(page, limit),
      events: this.getEvents(page, limit, startFrom, startTo)
    }).pipe(
      map(({ users, events }) => {
        const mappedData = this.mapUserEventsToDayPilotData(users.items, events.items);
        return {
          ...mappedData,
          pagination: { total: users.total, pages: users.pages }
        };
      })
    );
  }

  private getEvents(page: number, limit: number, from?: string, to?: string): Observable<any> {
    let url = `https://prez-cool-staging.appsolutions224.com/api/v1/events?limit=${limit}&page=${page}`;
    if (from) url += `&start_from=${from}`;
    if (to) url += `&start_to=${to}`;
    return this.http.get<any>(url);
  }

  private getUsers(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`https://prez-cool-staging.appsolutions224.com/api/v1/users?limit=${limit}&page=${page}`);
  }


  private mapUserEventsToDayPilotData(users: UserItem[], events: UserEvent[]): { events: DayPilot.EventData[], resources: DayPilot.ResourceData[] } {
    const daypilotEvents: DayPilot.EventData[] = events.map(event => ({
      id: event.id ?? DayPilot.guid(),
      resource: event.user_id?.toString(),
      start: new DayPilot.Date(new Date(event.start_time)),
      end: new DayPilot.Date(new Date(event.end_time)),
      text: event.notes ?? event.title ?? '',
      tags: {
        type: event.attendance_status ?? 'present',
      }
    }));

    const uniqueUserIds = [...new Set(events.map(e => e.user_id))];

    const daypilotResources: DayPilot.ResourceData[] = uniqueUserIds.map(id => {
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

    return { events: daypilotEvents, resources: daypilotResources };
  }
}
