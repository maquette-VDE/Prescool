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


  getUsersDayPilotData(): Observable<{ events: DayPilot.EventData[], resources: DayPilot.ResourceData[] }> {
    return forkJoin({
      users: this.getAllUsers(),
      events: this.getAllUserEvents()
    }).pipe(
      map(({ users, events }) => {
        return this.mapUserEventsToDayPilotData(users, events);
      })
    );
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

  getAllUserEvents(): Observable<UserEvent[]> {
    return this.http.get<any>('https://prez-cool-staging.appsolutions224.com/api/v1/events?limit=10&page=0')
      .pipe(
        map(response => response.items as UserEvent[])
      )
  }

  getAllUsers(): Observable<UserItem[]> {
    return this.http.get<any>('https://prez-cool-staging.appsolutions224.com/api/v1/users?limit=10&page=0')
      .pipe(
        map(response => response.items as UserItem[])
      )
  }
}
