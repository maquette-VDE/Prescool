import { Injectable, computed, signal } from '@angular/core';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'present' | 'absent' | 'late' | 'generic';
  lateTime?: string;
  reason?: string;
  startTime?: string;
  endTime?: string;
  depart?: boolean;
  heureDepart?: string;
}

const today = new Date().toISOString().split('T')[0];

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private eventsSignal = signal<CalendarEvent[]>([
    { id: crypto.randomUUID(), title: 'Présent(e)', date: today, type: 'present', startTime: '09:00', endTime: '18:00' },
    { id: crypto.randomUUID(), title: 'Absent(e) - "maladie"', date: today, type: 'absent', reason: 'maladie' },
    { id: crypto.randomUUID(), title: 'En retard - "transport"', date: today, type: 'late', reason: 'transport', lateTime: '09:30' }
  ]);

  getEvents() {
    return this.eventsSignal.asReadonly();
  }

  setEvents(events: CalendarEvent[]) {
    this.eventsSignal.set(events);
  }

  todayEvents = computed(() =>
    this.eventsSignal().filter((e) => e.date === today)
  );

  presentCountToday = computed(() =>    
    this.todayEvents().filter((e) => e.type === 'present').length
  );

  absentCountToday = computed(() =>
    this.todayEvents().filter((e) => e.type === 'absent').length
  );

  lateCountToday = computed(() =>
    this.todayEvents().filter((e) => e.type === 'late').length   
  );
}