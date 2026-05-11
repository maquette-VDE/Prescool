import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnnonceService } from '../../annonces/annonce.service';
import { EvenementsService } from '../../services/evenements/evenements-service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.scss'],
})
export class UserDashboard implements OnInit {
  private annonceService = inject(AnnonceService);
  private evenementsService = inject(EvenementsService);

  currentUser = signal<any>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  annonces = this.annonceService.getAnnonces();

  loading = signal(true);

  todayStatus = signal('Aucun pointage');

  presentThisWeek = signal(0);
  absentThisWeek = signal(0);
  lateThisWeek = signal(0);
  excusedThisWeek = signal(0);
  remoteThisWeek = signal(0);
  enMissionThisWeek = signal(0);

  presentLikeThisWeek = computed(() =>
    this.presentThisWeek() +
    this.lateThisWeek() +
    this.remoteThisWeek() +
    this.enMissionThisWeek()
  );

  totalWeek = computed(() =>
    this.presentThisWeek() +
    this.absentThisWeek() +
    this.lateThisWeek() +
    this.excusedThisWeek() +
    this.remoteThisWeek() +
    this.enMissionThisWeek()
  );

  attendanceRate = computed(() => {
    const total = this.totalWeek();

    if (total === 0) {
      return 0;
    }

    return Math.round((this.presentLikeThisWeek() / total) * 100);
  });

  ngOnInit(): void {
    const userId = this.currentUser()?.id;

    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.evenementsService.getMyTodayStatus(userId).subscribe({
      next: (status) => {
        this.todayStatus.set(status);
      },
      error: (error) => {
        console.error('Erreur statut utilisateur :', error);
        this.todayStatus.set('Aucun pointage');
      },
    });

    this.evenementsService.getMyWeeklyStats(userId).subscribe({
      next: (stats) => {
        this.presentThisWeek.set(stats.present);
        this.absentThisWeek.set(stats.absent);
        this.lateThisWeek.set(stats.late);
        this.excusedThisWeek.set(stats.excused);
        this.remoteThisWeek.set(stats.remote);
        this.enMissionThisWeek.set(stats.enMission);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur stats utilisateur :', error);
        this.loading.set(false);
      },
    });
  }
}