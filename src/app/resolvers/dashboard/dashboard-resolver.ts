import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { UsersService } from '../../services/users/users-service';

export interface DashboardStatsResponse {
  consultantsTotal: number;
  presentTotal: number;
  absentTotal: number;
  lateTotal: number;
}

export const dashboardResolver: ResolveFn<DashboardStatsResponse> = () => {
  const usersService = inject(UsersService);

  return forkJoin({
    consultants: usersService.getConsultantsAndStudents(),
    present: usersService.getUsersByAttendanceStatus('present'),
    absent: usersService.getUsersByAttendanceStatus('absent'),
    late: usersService.getUsersByAttendanceStatus('late'),
  }).pipe(
    map((response) => ({
      consultantsTotal: response.consultants.total ?? 0,
      presentTotal: response.present.total ?? 0,
      absentTotal: response.absent.total ?? 0,
      lateTotal: response.late.total ?? 0,
    }))
  );
};