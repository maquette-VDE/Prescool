import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface ApiEvent {
  id?: number;
  user_id: number;
  title?: string;
  start_time: string;
  end_time: string;
  event_type: 'presence';
  description?: string;
  all_day: boolean;
  status: 'scheduled';
  attendance_status: 'present' | 'absent' | 'late';
  notes?: string;
  source?: string;
}

export interface CreateEventPayload {
  user_id: number;
  title: string;
  start_time: string;
  end_time: string;
  event_type: 'presence';
  all_day: true;
  status: 'scheduled';
  attendance_status: 'present' | 'absent' | 'late';
  notes?: string;
  source: 'manual';
}

export interface UpdateEventPayload {
  title?: string;
  start_time?: string;
  end_time?: string;
  event_type?: 'presence';
  all_day?: boolean;
  attendance_status?: 'present' | 'absent' | 'late';
  notes?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  page: number;
}


@Injectable({ providedIn: 'root' })
export class PresencesService {

  private readonly http     = inject(HttpClient);
  private readonly API_BASE = 'https://prez-cool-staging.appsolutions224.com/api/v1';


  getMyEvents(
    userId: number,
    startFrom: string,
    startTo: string,
    attendanceStatus?: string,
  ): Observable<ApiEvent[]> {

    let params = new HttpParams()
      .set('user_id',    userId.toString())
      .set('limit',      '100');

    if (attendanceStatus) {
      params = params.set('attendance_status', attendanceStatus);
    }

    return this.http
      .get<PaginatedResponse<ApiEvent>>(`${this.API_BASE}/events`, { params })
      .pipe(map(res => res.items));
  }


  createEvent(payload: CreateEventPayload): Observable<ApiEvent> {
    return this.http.post<ApiEvent>(`${this.API_BASE}/events`, payload);
  }


  updateEvent(id: number, payload: UpdateEventPayload): Observable<ApiEvent> {
    return this.http.put<ApiEvent>(`${this.API_BASE}/events/${id}`, payload);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/events/${id}`);
  }

  static toStartISO(date: string): string {
    return `${date}T00:00:00.000Z`;
  }

  static toEndISO(date: string): string {
    return `${date}T23:59:59.999Z`;
  }


  static toDateStr(iso: string): string {
    return iso.split('T')[0];
  }
}
