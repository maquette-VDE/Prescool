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

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private annonceService = inject(AnnonceService);
  private router = inject(Router);
  private usersService = inject(UsersService);

  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  lineChart: Chart | null = null;

  donutChart: Chart<'doughnut', number[], string> | null = null;
  private chartReady = false;

  annonces = this.annonceService.getAnnonces();

  loading = signal(true);

  dashboardStats = signal<DashboardStatsResponse>({
    consultantsTotal: 0,
    presentTotal: 0,
    absentTotal: 0,
    lateTotal: 0,
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

  ngOnInit(): void {
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

          if (this.lineCanvas && !this.lineChart) {
            this.createLineChart();
          }

          this.chartReady = !!this.donutChart && !!this.lineChart;
        }, 50);
      },
      error: (error) => {
        console.error('Erreur chargement dashboard :', error);
        this.loading.set(false);
      },
    });
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
