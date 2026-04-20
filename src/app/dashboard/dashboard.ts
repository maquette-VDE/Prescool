import { CommonModule } from '@angular/common';
<<<<<<< Updated upstream
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
=======
import { Component, computed, inject } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop'; // Bien importé !

import { AnnouncementService } from '../services/announcement/announcement.service';
import { PresenceService } from '../services/presence.service';
import { UsersApiResponse } from '../interfaces/userItem';
>>>>>>> Stashed changes

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
<<<<<<< Updated upstream
export class Dashboard implements AfterViewInit, OnDestroy {
  private annonceService = inject(AnnonceService);
=======
export class Dashboard {
  private annonceService = inject(AnnouncementService);
  private presenceService = inject(PresenceService);
>>>>>>> Stashed changes
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  lineChart: Chart | null = null;

  donutChart: Chart<'doughnut', number[], string> | null = null;
  private chartReady = false;

  // --- CORRECTION ICI ---
  // On transforme l'Observable en Signal avec une valeur vide [] par défaut
  annonces = toSignal(this.annonceService.getAnnonces(), { initialValue: [] });

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

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return this.evenements().filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      return eventStart <= endOfDay && eventEnd >= startOfDay;
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

  statusCounts = computed(() => ({
    present: this.presentCount(),
    absent: this.absentCount(),
    late: this.lateCount(),
  }));

  presentCount = computed(() => this.dashboardStats()?.presentTotal ?? 0);
  absentCount = computed(() => this.dashboardStats()?.absentTotal ?? 0);
  lateCount = computed(() => this.dashboardStats()?.lateTotal ?? 0);

  // AJOUT : personnes sans événement aujourd'hui
  noEventCount = computed(() => {
    const count =
      this.consultantsTotal() -
      this.presentCount() -
      this.absentCount() -
      this.lateCount();
    return count > 0 ? count : 0;
  });

  weeklyStats = computed(
    () =>
      this.dashboardRouteData()?.['weeklyStats'] as {
        labels: string[];
        presentData: number[];
        absentData: number[];
        lateData: number[];
      },
  );

  weeklyPresenceData = computed(() => ({
    labels: this.weeklyStats()?.labels ?? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    presentData: this.weeklyStats()?.presentData ?? [0, 0, 0, 0, 0],
    absentData: this.weeklyStats()?.absentData ?? [0, 0, 0, 0, 0],
    lateData: this.weeklyStats()?.lateData ?? [0, 0, 0, 0, 0],
  }));

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
<<<<<<< Updated upstream
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
=======
    { title: 'Consultants', value: this.consultantsTotal() },
    { title: 'Présents aujourd’hui', value: this.presenceService.presentCountToday() },
    { title: 'Absents aujourd’hui', value: this.presenceService.absentCountToday() },
    { title: 'En retard', value: this.presenceService.lateCountToday() },
    { title: 'Annonces', value: this.annonces()?.length ?? 0 }
>>>>>>> Stashed changes
  ]);

  constructor() {
    effect(() => {
      const counts = this.statusCounts();
      const noEvent = this.noEventCount();
      const weeklyData = this.weeklyPresenceData();

      if (this.chartReady && this.donutChart) {
        this.donutChart.data.datasets[0].data = [
          counts.present,
          counts.absent,
          counts.late,
          noEvent,
        ];
        this.donutChart.update();
      }

      if (this.chartReady && this.lineChart) {
        this.lineChart.data.labels = weeklyData.labels;
        this.lineChart.data.datasets[0].data = weeklyData.presentData;
        this.lineChart.data.datasets[1].data = weeklyData.absentData;
        this.lineChart.data.datasets[2].data = weeklyData.lateData;
        this.lineChart.update();
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
            data: [counts.present, counts.absent, counts.late, noEvent],
            backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#9ca3af'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        interaction: {
          mode: 'nearest',
          intersect: true,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                const total = this.consultantsTotal();
                const value = Number(context.raw ?? 0);
                const percent =
                  total === 0 ? 0 : Math.round((value / total) * 100);

                return `${context.label} : ${value} (${percent}%)`;
              },
            },
          },
        },
      },
    });
  }

  createLineChart(): void {
    const weeklyData = this.weeklyPresenceData();

    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: weeklyData.labels,
        datasets: [
          {
            label: 'Présents',
            data: weeklyData.presentData,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.2)',
            tension: 0.3,
          },
          {
            label: 'Absents',
            data: weeklyData.absentData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.2)',
            tension: 0.3,
          },
          {
            label: 'Retards',
            data: weeklyData.lateData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245,158,11,0.2)',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
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
    if (this.lineChart) {
      this.lineChart.destroy();
      this.lineChart = null;
    }
  }
}
