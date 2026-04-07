import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { UsersService } from '../../services/users/users-service';

export interface DashboardWeeklyResponse {
  labels: string[];
  presentData: number[];
  absentData: number[];
  lateData: number[];
}

export const dashboardWeeklyResolver: ResolveFn<DashboardWeeklyResponse> = () => {
  const usersService = inject(UsersService);

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
      present: usersService.getUsersByAttendanceStatusForRange('present', start, end),
      absent: usersService.getUsersByAttendanceStatusForRange('absent', start, end),
      late: usersService.getUsersByAttendanceStatusForRange('late', start, end),
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
};