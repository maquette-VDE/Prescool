import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { Profile } from '../../interfaces/profile';
import { MOCK_PROFILES } from './planning.mock';

@Injectable({
  providedIn: 'root',
})
export class PlanningService {
  private readonly http = inject(HttpClient); 
  private readonly mockData = MOCK_PROFILES;
  private readonly MOCK_DELAY = 200;


  getProfiles(): Observable<Profile[]> {
    return of(this.mockData).pipe(delay(this.MOCK_DELAY));
  }


  getResources(): Observable<DayPilot.ResourceData[]> {
    return this.getProfiles().pipe(
      map(profiles => profiles.map(p => ({
        id: p.ressource.id,
        name: p.ressource.title
      })))
    );
  }

  getEvents(): Observable<DayPilot.EventData[]> {
    return this.getProfiles().pipe(
      map(profiles => this.mapProfilesToEvents(profiles))
    );
  }


  private mapProfilesToEvents(profiles: Profile[]): DayPilot.EventData[] {
    return profiles.flatMap(profile => 
      profile.events.map(event => ({
        id: event.id ?? DayPilot.guid(),
        resource: profile.ressource.id,
        start: new DayPilot.Date(event.start_time),
        end: new DayPilot.Date(event.end_time),
        text: event.notes ?? '',
        tags: { 
          type: event.event_type ?? 'presence'
        }
      }))
    );
  }
}