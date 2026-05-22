import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { UserEvent } from '../../interfaces/events';
import { UsersService } from '../users/users-service';

export interface DashboardWeeklyResponse {
  labels: string[];
  presentData: number[];
  absentData: number[];
  lateData: number[];
}

export interface UserWeeklyStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  remote: number;
  enMission: number;
}

@Injectable({
  providedIn: 'root',
})
export class EvenementsService {
  private readonly http = inject(HttpClient);
  private readonly usersService = inject(UsersService);

  readonly limit = 100;

  createEvent(data: any): Observable<UserEvent> {
    return this.http.post<UserEvent>(
      'https://prez-cool-staging.appsolutions224.com/api/v1/events',
      data,
    );
  }

  getEvenementsActifsToday(): Observable<UserEvent[]> {
    const now = new Date();

    const startOfDayUtc = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    const endOfDayUtc = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const url =
      `https://prez-cool-staging.appsolutions224.com/api/v1/events` +
      `?event_start_from=${encodeURIComponent(startOfDayUtc.toISOString())}` +
      `&event_end_to=${encodeURIComponent(endOfDayUtc.toISOString())}` +
      `&limit=${this.limit}`;

    return this.http
      .get<any>(url)
      .pipe(map((response) => response.items as UserEvent[]));
  }

  getEventsForRange(start: Date, end: Date): Observable<UserEvent[]> {
    const url =
      `https://prez-cool-staging.appsolutions224.com/api/v1/events` +
      `?event_start_from=${encodeURIComponent(start.toISOString())}` +
      `&event_end_to=${encodeURIComponent(end.toISOString())}` +
      `&limit=${this.limit}`;

    return this.http
      .get<any>(url)
      .pipe(map((response) => response.items as UserEvent[]));
  }

  getMyEventsForRange(
    userId: number,
    from: string,
    to: string,
  ): Observable<UserEvent[]> {
    const params = new HttpParams()
      .set('user_id', userId.toString())
      .set('event_start_from', from)
      .set('event_end_to', to)
      .set('limit', this.limit.toString());

    return this.http
      .get<any>('https://prez-cool-staging.appsolutions224.com/api/v1/events', {
        params,
      })
      .pipe(map((response) => response.items as UserEvent[]));
  }

  getMyTodayStatus(userId: number): Observable<string> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.getMyEventsForRange(
      userId,
      start.toISOString(),
      end.toISOString(),
    ).pipe(
     map((events) => {
      const myEvents = events
        .filter((event) => {
          const eventDate = new Date(event.start_time);
          return eventDate >= start && eventDate <= end;
        })
        .sort(
          (a, b) =>
            new Date(b.start_time).getTime() -
            new Date(a.start_time).getTime(),
        );

      if (myEvents.length === 0) {
        return 'Aucun pointage';
      }

      const latestEvent = myEvents[0];

      switch (latestEvent.attendance_status) {
        case 'present':
          return 'Présent';
        case 'absent':
          return 'Absent';
        case 'late':
          return 'En retard';
        case 'excused':
          return 'Excusé';
        case 'remote':
          return 'Télétravail';
        case 'en_mission':
          return 'En mission';
        default:
          return 'Aucun pointage';
      }
    }),
  );
}

  getMyWeeklyStats(userId: number): Observable<UserWeeklyStats> {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    return this.getMyEventsForRange(
      userId,
      monday.toISOString(),
      friday.toISOString(),
    ).pipe(
      map((events) =>
        events.filter((event) => {
          const eventDate = new Date(event.start_time);
          return eventDate >= monday && eventDate <= friday;
        }),
      ),
      map((myEvents) => ({
        present: myEvents.filter(
          (event) => event.attendance_status === 'present',
        ).length,
        absent: myEvents.filter((event) => event.attendance_status === 'absent')
          .length,
        late: myEvents.filter((event) => event.attendance_status === 'late')
          .length,
        excused: myEvents.filter(
          (event) => event.attendance_status === 'excused',
        ).length,
        remote: myEvents.filter((event) => event.attendance_status === 'remote')
          .length,
        enMission: myEvents.filter(
          (event) => event.attendance_status === 'en_mission',
        ).length,
      })),
    );
  }

  getWeeklyStats(): Observable<DashboardWeeklyResponse> {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

    const requests = labels.map((_, index) => {
      const start = new Date(monday);
      start.setDate(monday.getDate() + index);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      return forkJoin({
        present: this.usersService.getUsersByAttendanceStatusForRange(
          'present',
          start,
          end,
        ),
        absent: this.usersService.getUsersByAttendanceStatusForRange(
          'absent',
          start,
          end,
        ),
        late: this.usersService.getUsersByAttendanceStatusForRange(
          'late',
          start,
          end,
        ),
      });
    });

    return forkJoin(requests).pipe(
      map((days) => ({
        labels,
        presentData: days.map((d) => d.present.total ?? 0),
        absentData: days.map((d) => d.absent.total ?? 0),
        lateData: days.map((d) => d.late.total ?? 0),
      })),
    );
  }

  getMonthlyStats(): Observable<DashboardWeeklyResponse> {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];

    const requests = labels.map((_, index) => {
      const start = new Date(startOfMonth);
      start.setDate(startOfMonth.getDate() + index * 7);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      return forkJoin({
        present: this.usersService.getUsersByAttendanceStatusForRange(
          'present',
          start,
          end,
        ),
        absent: this.usersService.getUsersByAttendanceStatusForRange(
          'absent',
          start,
          end,
        ),
        late: this.usersService.getUsersByAttendanceStatusForRange(
          'late',
          start,
          end,
        ),
      });
    });

    return forkJoin(requests).pipe(
      map((weeks) => ({
        labels,
        presentData: weeks.map((w) => w.present.total ?? 0),
        absentData: weeks.map((w) => w.absent.total ?? 0),
        lateData: weeks.map((w) => w.late.total ?? 0),
      })),
    );
  }
}
