import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { UserEvent } from '../../interfaces/events';
import { UserItem } from '../../interfaces/userItem';

@Injectable({
  providedIn: 'root',
})
export class PlanningService {
  private readonly http = inject(HttpClient);

  getUsersDayPilotData(
    page: number = 0,
    limit: number = 4,
    startFrom?: string,
    startTo?: string,
    search?: string,
    status?: string,
    specialty?: string
  ): Observable<{
    events: DayPilot.EventData[],
    resources: DayPilot.ResourceData[],
    pagination: { total: number, pages: number }
  }> {
    return this.getUsers(search).pipe(
      switchMap(usersResponse => {
        const users = usersResponse.items;
        console.log('users: ', users);

        return this.getEvents(0, 100, startFrom, startTo).pipe(
          map(eventsResponse => {
            const allEvents = eventsResponse.items;

            const mappedData = this.mapUserEventsToDayPilotData(users, allEvents);

            return {
              ...mappedData,
              pagination: {
                total: usersResponse.total,
                pages: usersResponse.pages
              }
            };
          })
        );
      })
    );
  }

  private getUsers( search?: string, status?: string, specialty?: string): Observable<any> {
    let url = `https://prez-cool-staging.appsolutions224.com/api/v1/users?limit=100&page=0`;
    if (search) {
      url += `&first_name=${encodeURIComponent(search)}`;
      url += `&last_name=${encodeURIComponent(search)}`;
    }
    if (status) url += `&status=${status}`;
    if (specialty) url += `&code=${specialty}`;
    return this.http.get<any>(url);
  }

  private getEvents(page: number, limit: number, from?: string, to?: string): Observable<any> {
    let url = `https://prez-cool-staging.appsolutions224.com/api/v1/events?limit=${limit}&page=${page}`;
    if (from) url += `&start_from=${from}`;
    if (to) url += `&start_to=${to}`;
    return this.http.get<any>(url);
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
