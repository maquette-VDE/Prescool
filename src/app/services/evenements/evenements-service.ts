import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin,map, Observable } from 'rxjs';
import { UserEvent } from '../../interfaces/events';
import { UsersService } from '../users/users-service';


export interface DashboardWeeklyResponse {
  labels: string[];
  presentData: number[];
  absentData: number[];
  lateData: number[];
}

@Injectable({
  providedIn: 'root',
})
export class EvenementsService {
  private readonly http = inject(HttpClient);
  private readonly usersService = inject(UsersService);

  readonly limit = 100;

  getEvenementsActifsToday(): Observable<UserEvent[]> {
    const now = new Date();

  const startOfDayUtc = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));

  const endOfDayUtc = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    23, 59, 59, 999
  ));


     const url =
      `https://prez-cool-staging.appsolutions224.com/api/v1/events` +
      `?event_start_from=${encodeURIComponent(startOfDayUtc.toISOString())}` +
      `&event_end_to=${encodeURIComponent(endOfDayUtc.toISOString())}` +
      `&limit=${this.limit}`;

    return this.http
      .get<any>(url)
      .pipe(map((response) => response.items as UserEvent[]));
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
        present: this.usersService.getUsersByAttendanceStatusForRange('present', start, end),
        absent: this.usersService.getUsersByAttendanceStatusForRange('absent', start, end),
        late: this.usersService.getUsersByAttendanceStatusForRange('late', start, end),
      });
    });

    return forkJoin(requests).pipe(
      map((days) => ({
        labels,
        presentData: days.map((d) => d.present.total ?? 0),
        absentData: days.map((d) => d.absent.total ?? 0),
        lateData: days.map((d) => d.late.total ?? 0),
      }))
    );
  }
}
