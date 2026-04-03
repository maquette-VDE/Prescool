import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject,
  OnDestroy,
} from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Chart, registerables } from 'chart.js';

import { AnnonceService } from '../annonces/annonce.service';
import { DashboardStatsResponse } from '../resolvers/dashboard/dashboard-resolver';
import { UserEvent } from '../interfaces/events';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements AfterViewInit, OnDestroy {
  private annonceService = inject(AnnonceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  lineChart: Chart | null = null;

  donutChart: Chart<'doughnut', number[], string> | null = null;
  private chartReady = false;

  annonces = this.annonceService.getAnnonces();

  private dashboardRouteData = toSignal(this.route.data);

  dashboardStats = computed(
    () =>
      this.dashboardRouteData()?.['dashboardStats'] as DashboardStatsResponse,
  );

  evenements = computed(
    () => (this.dashboardRouteData()?.['evenements'] as UserEvent[]) ?? [],
  );

  consultantsTotal = computed(
    () => this.dashboardStats()?.consultantsTotal ?? 0,
  );

  activeTodayEvents = computed(() => {
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

  // AJOUT : personnes sans événement aujourd'hui
  noEventCount = computed(() => {
    const count = this.consultantsTotal() - this.latestEventByUser().size;
    return count > 0 ? count : 0;
  });

  attendanceRate = computed(() => {
    const total = this.consultantsTotal();

    const presents = this.presentCount() + this.lateCount();

    if (total === 0) {
      return 0;
    }

    return Math.round((presents / total) * 100);
  });

  presentPercent = computed(() => {
    const total = this.consultantsTotal();
    if (total === 0) return 0;
    return Math.round((this.presentCount() / total) * 100);
  });

  absentPercent = computed(() => {
    const total = this.consultantsTotal();
    if (total === 0) return 0;
    return Math.round((this.absentCount() / total) * 100);
  });

  latePercent = computed(() => {
    const total = this.consultantsTotal();
    if (total === 0) return 0;
    return Math.round((this.lateCount() / total) * 100);
  });

  noEventPercent = computed(() => {
    const total = this.consultantsTotal();
    if (total === 0) return 0;
    return Math.round((this.noEventCount() / total) * 100);
  });

  stats = computed(() => [
    {
      key: 'consultants',
      title: 'Consultants&Etudiants',
      value: this.consultantsTotal(),
    },
    {
      key: 'present',
      title: 'Présents aujourd’hui',
      value: this.presentCount(),
    },
    { key: 'absent', title: 'Absents aujourd’hui', value: this.absentCount() },
    { key: 'late', title: 'En retard', value: this.lateCount() },
    { key: 'annonces', title: 'Annonces', value: this.annonces().length },
  ]);

  constructor() {
  effect(() => {
    const counts = this.statusCounts();
    const noEvent = this.noEventCount();

    if (this.chartReady && this.donutChart) {
      this.donutChart.data.datasets[0].data = [
        counts.present,
        counts.absent,
        counts.late,
        noEvent
      ];
      this.donutChart.update();
    }
  });
}

  // AJOUT : Angular appelle ça après affichage du HTML
  ngAfterViewInit(): void {
    this.createDonutChart();
    this.createLineChart();
    this.chartReady = true;
  }

  createDonutChart(): void {
  const counts = this.statusCounts();
  const noEvent = this.noEventCount();

  this.donutChart = new Chart(this.donutCanvas.nativeElement, {
    type: 'doughnut',
    data: {
      labels: ['Présents', 'Absents', 'Retards', 'Sans pointage'],
      datasets: [
        {
          data: [
            counts.present,
            counts.absent,
            counts.late,
            noEvent
          ],
          backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#9ca3af'],
          borderWidth: 0
        }
      ]
    },
    options: {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  interaction: {
    mode: 'nearest',
    intersect: true
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => {
          const total = this.consultantsTotal();
          const value = Number(context.raw ?? 0);
          const percent = total === 0 ? 0 : Math.round((value / total) * 100);

          return `${context.label} : ${value} (${percent}%)`;
        }
      }
    }
  }
}
  });
}


createLineChart(): void {
  this.lineChart = new Chart(this.lineCanvas.nativeElement, {
    type: 'line',
    data: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
      datasets: [
        {
          label: 'Présents',
          data: [120, 130, 125, 140, 135],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.2)',
          tension: 0.3
        },
        {
          label: 'Absents',
          data: [20, 18, 22, 15, 17],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.2)',
          tension: 0.3
        },
        {
          label: 'Retards',
          data: [5, 7, 4, 6, 3],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.2)',
          tension: 0.3
        }
      ]
    },
    options: {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
  });
}

  openStat(statKey: string): void {
    if (statKey === 'consultants') {
      this.router.navigate(['/sidenav/consultant']);
      return;
    }

    if (statKey === 'present') {
      this.router.navigate(['/sidenav/consultant'], {
        queryParams: { status: 'present' },
      });
      return;
    }

    if (statKey === 'absent') {
      this.router.navigate(['/sidenav/consultant'], {
        queryParams: { status: 'absent' },
      });
      return;
    }

    if (statKey === 'late') {
      this.router.navigate(['/sidenav/consultant'], {
        queryParams: { status: 'late' },
      });
      return;
    }

    if (statKey === 'annonces') {
      this.router.navigate(['/sidenav/annonces']);
    }
  }

  // destruction propre du graphique quand on quitte la page
  ngOnDestroy(): void {
    if (this.donutChart) {
      this.donutChart.destroy();
      this.donutChart = null;
    }
  }
}
