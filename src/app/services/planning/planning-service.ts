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
      const colors: { [key: string]: string } = { 'presence': '#93c47d', 'retard': '#f6b26b', 'absence': '#e06666'};
      return colors[i] || colors['presence'];
    },
    barBackColor: (i: string) => {
      const colors: { [key: string]: string } = { 'presence': '#d9ead3', 'retard': '#fce5cd', 'absence': '#f4cccc' };
      return colors[i] || colors['presence'];
    }
  }
  private profiles: Profile[] =
[
  // Aly
  {
    ressource: { id: 'NJE132', title: 'Aly' },
    events: [{
      resource: 'NJE132',
      start_time: '2026-01-12T08:00:00',
      end_time: '2026-01-12T18:00:00',
      event_type: 'presence',
      id: 101
    },
    {
      resource: 'NJE132',
      start_time: '2026-01-13T08:00:00',
      end_time: '2026-01-13T18:00:00',
      event_type: 'presence',
      id: 102
    }
  ]
  },

  // Emilie - Avec une absence
  {
    ressource: { id: 'NJE405', title: 'Emilie' },
    events: [{
      resource: 'NJE405',
      start_time: '2026-01-12T09:00:00',
      end_time: '2026-01-12T17:30:00',
      event_type: 'absence',
      notes: 'Rendez-vous médical',
      id: 201
    },
     {
      resource: 'NJE405',
      start_time: '2026-01-14T08:00:00',
      end_time: '2026-01-14T18:00:00',
      event_type: 'absence',
      notes: 'Rendez-vous médical',
      id: 202
    }]
  },

  // Feriel - Avec un retard
  {
    ressource: { id: 'NJE235', title: 'Feriel' },
    events: [{
      resource: 'NJE235',
      start_time: '2026-01-15T10:30:00',
      end_time: '2026-01-15T19:00:00',
      event_type: 'retard',
      notes: 'Problème de transport',
      id: 301
    }]
  },
  // Ibrahima
  {
    ressource: { id: 'NJE212', title: 'Ibrahima' },
    events: [{
      resource: 'NJE212',
      start_time: '2026-01-12T08:30:00',
      end_time: '2026-01-12T17:00:00',
      event_type: 'presence',
      id: 401
    }]
  },
  // Camille
  {
    ressource: { id: 'NJE215', title: 'Camille' },
    events: [{
      resource: 'NJE215',
      start_time: '2026-01-12T08:30:00',
      end_time: '2026-01-12T17:00:00',
      event_type: 'presence',
      id: 408
    },
    {
      resource: 'NJE215',
      start_time: '2026-01-13T08:30:00',
      end_time: '2026-01-13T17:00:00',
      event_type: 'presence',
      id: 409
    }

  ]
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

  getEvents(): Observable<DayPilot.EventData[]> {
   const events: DayPilot.EventData[] = this.profiles.flatMap((p) => 
  p.events.map((e) => ({
    id: e.id || DayPilot.guid(), // Sécurité si l'ID est manquant
    resource: p.ressource.id,    // On utilise l'ID de la ressource du profil
    start: e.start_time,
    end: e.end_time,
    text: e.notes ?? '',
    tags: { 
      type: e.event_type ?? "presence",
      comment: e.notes ?? "" 
    }
  }))
);

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
