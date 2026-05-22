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
  OnInit,
  signal,
} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { AnnonceService } from '../annonces/annonce.service';
import { DashboardStatsResponse } from '../resolvers/dashboard/dashboard-resolver';
import { UsersService } from '../services/users/users-service';
import { EvenementsService } from '../services/evenements/evenements-service';
import { UserDashboard } from './user-dashboard/user-dashboard';
import { MatIconModule } from '@angular/material/icon';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, UserDashboard, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private annonceService = inject(AnnonceService);
  private router = inject(Router);
  private usersService = inject(UsersService);
  private evenementsService = inject(EvenementsService);

  currentUser = signal<any>(JSON.parse(localStorage.getItem('user') || 'null'));

  currentRole = computed(() => {
    const user = this.currentUser();

    return (
      user?.role?.name ||
      user?.role_name ||
      user?.role ||
      user?.roles?.[0]?.name ||
      user?.roles?.[0] ||
      ''
    )
      .toString()
      .toUpperCase();
  });

  isAdminOrExpert = computed(() => {
    const role = this.currentRole();

    return role === 'ADMIN';
  });

  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  lineChart: Chart | null = null;
  donutChart: Chart<'doughnut', number[], string> | null = null;

  private chartReady = false;

  annonces = this.annonceService.getAnnonces();

  loading = signal(true);

  currentDate = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

  dashboardStats = signal<DashboardStatsResponse>({
    consultantsTotal: 0,
    presentTotal: 0,
    absentTotal: 0,
    lateTotal: 0,
  });

  weeklyLoading = signal(true);
  presencePeriod = signal<'week' | 'month'>('week');

  currentPeriodLabel = computed(() => {
    const now = new Date();

    const formattedDate = now.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (this.presencePeriod() === 'week') {
      return formattedDate;
    }

    return now.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  });

  weeklyStats = signal<{
    labels: string[];
    presentData: number[];
    absentData: number[];
    lateData: number[];
  }>({
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    presentData: [0, 0, 0, 0, 0],
    absentData: [0, 0, 0, 0, 0],
    lateData: [0, 0, 0, 0, 0],
  });

  consultantsTotal = computed(() => this.dashboardStats().consultantsTotal);

  statusCounts = computed(() => ({
    present: this.presentCount(),
    absent: this.absentCount(),
    late: this.lateCount(),
  }));

  presentCount = computed(() => this.dashboardStats().presentTotal);
  absentCount = computed(() => this.dashboardStats().absentTotal);
  lateCount = computed(() => this.dashboardStats().lateTotal);

  // AJOUT : personnes sans événement aujourd'hui
  noEventCount = computed(() => {
    const count =
      this.consultantsTotal() -
      this.presentCount() -
      this.absentCount() -
      this.lateCount();
    return count > 0 ? count : 0;
  });

  weeklyPresenceData = computed(() => ({
    labels: this.weeklyStats().labels,
    presentData: this.weeklyStats().presentData,
    absentData: this.weeklyStats().absentData,
    lateData: this.weeklyStats().lateData,
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
    {
      key: 'consultants',
      title: 'Consultants&Etudiants',
      value: this.consultantsTotal(),
      icon: 'group',
    },
    {
      key: 'present',
      title: 'Présents aujourd’hui',
      value: this.presentCount(),
      icon: 'check_circle',
    },
    {
      key: 'absent',
      title: 'Absents aujourd’hui',
      value: this.absentCount(),
      icon: 'cancel',
    },
    {
      key: 'late',
      title: 'En retard',
      value: this.lateCount(),
      icon: 'schedule',
    },
    {
      key: 'annonces',
      title: 'Annonces',
      value: this.annonces().length,
      icon: 'campaign',
    },
  ]);

  ngOnInit(): void {
    if (!this.isAdminOrExpert()) {
      this.loading.set(false);
      this.weeklyLoading.set(false);
      return;
    }

    forkJoin({
      consultants: this.usersService.getConsultantsAndStudents(),
      present: this.usersService.getUsersByAttendanceStatus('present'),
      absent: this.usersService.getUsersByAttendanceStatus('absent'),
      late: this.usersService.getUsersByAttendanceStatus('late'),
    }).subscribe({
      next: (response) => {
        this.dashboardStats.set({
          consultantsTotal: response.consultants.total ?? 0,
          presentTotal: response.present.total ?? 0,
          absentTotal: response.absent.total ?? 0,
          lateTotal: response.late.total ?? 0,
        });
        this.loading.set(false);

        setTimeout(() => {
          if (this.donutCanvas && !this.donutChart) {
            this.createDonutChart();
          }

          this.chartReady = !!this.donutChart || !!this.lineChart;
        }, 50);
      },
      error: (error) => {
        console.error('Erreur chargement dashboard :', error);
        this.loading.set(false);
      },
    });

    this.loadWeeklyPresenceStats();
  }

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
  ngAfterViewInit(): void {}

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
        animation: {
          animateRotate: true,
          duration: 1000,
        },
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

    const todayLinePlugin = {
      id: 'todayLine',
      afterDatasetsDraw: (chart: any) => {
        const isWeek = this.presencePeriod() === 'week';
        const isMonth = this.presencePeriod() === 'month';

        if (!isWeek && !isMonth) return;

        let currentIndex = 0;

        if (isWeek) {
          const today = new Date().getDay();
          currentIndex = today === 0 ? -1 : today - 1;
        } else {
          const currentDay = new Date().getDate();

          if (currentDay <= 7) {
            currentIndex = 0;
          } else if (currentDay <= 14) {
            currentIndex = 1;
          } else if (currentDay <= 21) {
            currentIndex = 2;
          } else {
            currentIndex = 3;
          }
        }

        const maxIndex = isWeek ? 4 : 3;

        if (currentIndex < 0 || currentIndex > maxIndex) return;

        const x = chart.scales.x.getPixelForValue(currentIndex);
        const topY = chart.chartArea.top;
        const bottomY = chart.chartArea.bottom;
        const ctx = chart.ctx;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#94a3b8';
        ctx.setLineDash([6, 6]);
        ctx.stroke();

        ctx.fillStyle = '#111827';
        ctx.font = '600 12px Arial';
        ctx.fillText('Aujourd’hui', x - 35, topY - 18);

        ctx.restore();
      },
    };

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
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
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
      plugins: [todayLinePlugin],
    });
  }

  changePresencePeriod(period: 'week' | 'month'): void {
    this.presencePeriod.set(period);

    if (period === 'week') {
      this.loadWeeklyPresenceStats();
    } else {
      this.loadMonthlyPresenceStats();
    }
  }

  loadWeeklyPresenceStats(): void {
    this.weeklyLoading.set(true);

    this.evenementsService.getWeeklyStats().subscribe({
      next: (stats) => {
        this.weeklyStats.set({
          labels: stats.labels ?? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
          presentData: stats.presentData ?? [0, 0, 0, 0, 0],
          absentData: stats.absentData ?? [0, 0, 0, 0, 0],
          lateData: stats.lateData ?? [0, 0, 0, 0, 0],
        });

        this.weeklyLoading.set(false);

        setTimeout(() => {
          if (this.lineCanvas && !this.lineChart) {
            this.createLineChart();
          }

          this.chartReady = !!this.donutChart || !!this.lineChart;
        }, 50);
      },
      error: (error) => {
        console.error('Erreur chargement stats semaine :', error);
        this.weeklyLoading.set(false);
      },
    });
  }

  loadMonthlyPresenceStats(): void {
    this.weeklyLoading.set(true);

    this.evenementsService.getMonthlyStats().subscribe({
      next: (stats) => {
        this.weeklyStats.set({
          labels: stats.labels ?? ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
          presentData: stats.presentData ?? [0, 0, 0, 0],
          absentData: stats.absentData ?? [0, 0, 0, 0],
          lateData: stats.lateData ?? [0, 0, 0, 0],
        });

        this.weeklyLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement stats mois :', error);
        this.weeklyLoading.set(false);
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
