import { Profile } from '../../interfaces/profile';

export const MOCK_PROFILES: Profile[] =
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