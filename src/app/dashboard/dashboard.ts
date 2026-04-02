import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AnnonceService } from '../annonces/annonce.service';
import { DashboardStatsResponse } from '../resolvers/dashboard/dashboard-resolver';
import { UserEvent } from '../interfaces/events';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  private annonceService = inject(AnnonceService);
  private route = inject(ActivatedRoute);

  annonces = this.annonceService.getAnnonces();

  private dashboardRouteData = toSignal(this.route.data);


  dashboardStats = computed(
    () => this.dashboardRouteData()?.['dashboardStats'] as DashboardStatsResponse
  );

  evenements = computed(
    () => (this.dashboardRouteData()?.['evenements'] as UserEvent[]) ?? []
  );

  consultantsTotal = computed(() => this.dashboardStats()?.consultantsTotal ?? 0);

  activeTodayEvents = computed(() => {
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

    return this.evenements().filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      return eventStart <= endOfDayUtc && eventEnd >= startOfDayUtc;
    });
  });

  latestEventByUser = computed(() => {
    const map = new Map<number, UserEvent>();

    this.activeTodayEvents().forEach((event) => {
      const existing = map.get(event.user_id);

      if (!existing) {
        map.set(event.user_id, event);
        return;
      }

      const existingDate = new Date(existing.start_time).getTime();
      const currentDate = new Date(event.start_time).getTime();

      if (currentDate > existingDate) {
        map.set(event.user_id, event);
      }
    });

    return map;
  });

  statusCounts = computed(() => {
    let present = 0;
    let absent = 0;
    let late = 0;

    this.latestEventByUser().forEach((event) => {
      const status = event.attendance_status;

      if (status === 'late') {
        late++;
      } else if (status === 'present' || status === 'en_mission') {
        present++;
      } else if (status === 'absent' || status === 'excused') {
        absent++;
      }
    });

    return { present, absent, late };
  });

  presentCount = computed(() => this.statusCounts().present);
  absentCount = computed(() => this.statusCounts().absent);
  lateCount = computed(() => this.statusCounts().late);

  attendanceRate = computed(() => {
    const total = this.consultantsTotal();
    const presents = this.presentCount();

    if (total === 0) {
      return 0;
    }

    return Math.round((presents / total) * 100);
  });


  stats = computed(() => [
    { title: 'Consultants&Etudiants', value: this.consultantsTotal() },
    { title: 'Présents aujourd’hui', value: this.presentCount() },
    { title: 'Absents aujourd’hui', value: this.absentCount() },
    { title: 'En retard', value: this.lateCount() },
    { title: 'Taux de présence', value: this.attendanceRate() + ' %' },
    { title: 'Annonces', value: this.annonces().length }
  ]);
}