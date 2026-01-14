import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { HttpClient } from '@angular/common/http';
import { Profile } from '../../interfaces/profile';

@Injectable({
  providedIn: 'root',
})
export class PlanningService {
  app = {
    barColor: (i: string) => {
      const colors: { [key: string]: string } = { 'presence': '#93c47d', 'retard': '#f6b26b', 'absence': '#e06666', 'autre': '#8e7cc3' };
      return colors[i] || colors['presence'];
    },
    barBackColor: (i: string) => {
      const colors: { [key: string]: string } = { 'presence': '#d9ead3', 'retard': '#fce5cd', 'absence': '#f4cccc', 'autre': '#ead1dc' };
      return colors[i] || colors['presence'];
    }
  }
  private profiles: Profile[] = [
    {
      ressource: { id: 'NJE132', title: 'Aly' },
      events: {
        resource: 'NJE132',
        start: '2026-01-15T08:00:00',
        end: '2026-01-15T18:00:00',
        type: 'presence',
        title: '8h00-18h00',
        barColor: this.app.barColor('presence'),
        barBackColor: this.app.barBackColor('presence')
      },
    },
    {
      ressource: { id: 'NJE405', title: 'Emilie' },
      events: {
        resource: 'NJE405',
        start: '2026-01-15T08:30:00',
        end: '2026-01-15T18:00:00',
        type: 'presence',
        barColor: this.app.barColor('presence'),
        barBackColor: this.app.barBackColor('presence'),
        title: '8h30-18h00',
      },
    },
    {
      ressource: { id: 'NJE235', title: 'Feriel' },
      events: {
        resource: 'NJE235',
        start: '2026-01-15T08:00:00',
        end: '2026-01-15T17:00:00',
        type: 'absence',
        title: '8h00-17h00',
        barColor: this.app.barColor('absence'),
        barBackColor: this.app.barBackColor('absence')
      },
    },
    {
      ressource: { id: 'NJE212', title: 'Ibrahima' },
      events: {
        resource: 'NJE212',
        start: '2026-01-15T09:30:00',
        end: '2026-01-15T17:30:00',
        type: 'retard',
        title: '9h30-17h30',
        barColor: this.app.barColor('retard'),
        barBackColor: this.app.barBackColor('retard')
      },
    },
  ];

  constructor(private http: HttpClient) {}


  getResources(): Observable<any[]> {
    const resources = this.profiles.map((p) => ({
      id: p.ressource.id,
      name: p.ressource.title,
    }));

    return new Observable((observer) => {
      setTimeout(() => {
        observer.next(resources);
        observer.complete();
      }, 200);
    });
  }

  getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<DayPilot.EventData[]> {
    const events: DayPilot.EventData[] = this.profiles.map((p) => ({
      id: p.ressource.id + '_event',
      start: new DayPilot.Date(p.events.start),
      end: new DayPilot.Date(p.events.end),
      resource: p.events.resource,
      text: p.events.title,
      barColor: '#3c78d8',
    }));

    return new Observable((observer) => {
      setTimeout(() => {
        observer.next(events);
        observer.complete();
      }, 200);
    });
  }

  getProfiles(): Observable<Profile[]> {
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next(this.profiles);
        observer.complete();
      }, 200);
    });
  }
}
