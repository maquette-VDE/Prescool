import { Injectable } from '@angular/core';
import { Profile } from '../../interfaces/profile';
import { Events } from '../../interfaces/events';

@Injectable({
  providedIn: 'root',
})
export class PlanningService {

  getProfiles(): Profile[] {
    const profils: Profile[] = [
      {
        ressource: { id: 'NJE132', title: 'Aly' },
        events: {
          resourceId: 'NJE132',
          start: '2025-12-15T08:00',
          end: '2025-12-15T18:00',
          title: '8h00-18h00',
        }
      },
      {
        ressource: { id: 'NJE405', title: 'Emilie' },
        events: {
          resourceId: 'NJE405',
          start: '2025-12-15T08:30',
          end: '2025-12-15T18:00',
          title: '8h30-18h00',
        }
      },
      {
        ressource: { id: 'NJE235', title: 'Feriel' },
        events: {
          resourceId: 'NJE235',
          start: '2025-12-15T08:00',
          end: '2025-12-15T17:00',
          title: '8h00-17h00',
        }
      },
      {
        ressource: { id: 'NJE212', title: 'Ibrahima' },
        events: {
          resourceId: 'NJE212',
          start: '2025-12-15T09:30',
          end: '2025-12-15T17:30',
          title: '9h30-17h30',
        }
      },
    ];

    return profils;
  }
}
