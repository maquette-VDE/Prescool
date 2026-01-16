import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { PLANNING_MOCK } from './planning.mock';
import { UserEvent } from '../../interfaces/events';
import { MOCK_USERS_RESPONSE } from './users.mock';

@Injectable({
  providedIn: 'root',
})
export class PlanningService {
  private readonly http = inject(HttpClient); 
  private readonly mockData = PLANNING_MOCK;
  private readonly MOCK_DELAY = 200;



 getUsersDayPilotData(): Observable<{ events: DayPilot.EventData[], resources: DayPilot.ResourceData[] }> {
  return of(this.mapUserEventsToDayPilotData(this.mockData.items)).pipe(delay(this.MOCK_DELAY));
}

private mapUserEventsToDayPilotData(events: UserEvent[]): { events: DayPilot.EventData[], resources: DayPilot.ResourceData[] } {

  const daypilotEvents: DayPilot.EventData[] = events.map(event => {
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    return {
    id: event.id ?? DayPilot.guid(),
    resource: event.user_id?.toString(), 
    start: new DayPilot.Date(startDate),
    end: new DayPilot.Date(endDate),
    text: event.notes ?? event.title ?? '',
    tags: { 
      type: event.attendance_status ?? 'present',

    }}
  });

  const allUsers = MOCK_USERS_RESPONSE.items;
  const uniqueUserIds = [...new Set(events.map(e => e.user_id))];

  const daypilotResources: DayPilot.ResourceData[] = uniqueUserIds.map(id => {
    const user = allUsers.find(u => u.id === id);
    
    return {
      id: id?.toString() ?? '',
      name: user ? `${user.first_name}` : `Utilisateur ${id}`,
      tags: {
        code: user?.code ?? '',
        phone_number: user?.phone_number ?? ''
      }
    };
  });
  return {
    events: daypilotEvents,
    resources: daypilotResources
  };
}

}