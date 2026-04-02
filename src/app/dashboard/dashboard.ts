import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, computed, effect, inject, OnDestroy  } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
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

  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  chart: Chart<'pie', number[], string> | null = null; // AJOUT : instance du graphique
  private chartReady = false;

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




  stats = computed(() => [
    { title: 'Consultants&Etudiants', value: this.consultantsTotal() },
    { title: 'Présents aujourd’hui', value: this.presentCount() },
    { title: 'Absents aujourd’hui', value: this.absentCount() },
    { title: 'En retard', value: this.lateCount() },
    { title: 'Sans pointage', value: this.noEventCount() },
    { title: 'Taux de présence', value: this.attendanceRate() + ' %' },
    { title: 'Annonces', value: this.annonces().length }
  ]);

  constructor() {
    // dès que statusCounts change, on met à jour le camembert
    effect(() => {
      const counts = this.statusCounts();

      if (!this.chartReady || !this.chart) {
        return;
      }

      this.chart.data.datasets[0].data = [
        counts.present,
        counts.absent,
        counts.late,
        this.noEventCount()
      ];

      this.chart.update();
    });
  }

  // AJOUT : Angular appelle ça après affichage du HTML
  ngAfterViewInit(): void {
    this.createChart();
    this.chartReady = true;
  }

  // AJOUT : création du graphique camembert
  createChart(): void {
    const counts = this.statusCounts();
    const noEvent = this.noEventCount();

    this.chart = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Présent', 'Absent', 'Retard', 'Sans pointage'],
        datasets: [
          {
            data: [counts.present, counts.absent, counts.late, noEvent],
            backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#9ca3af'], // AJOUT : couleurs du camembert
            borderWidth: 1
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
        }
      }
    });
  }

  // AJOUT : destruction propre du graphique quand on quitte la page
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}