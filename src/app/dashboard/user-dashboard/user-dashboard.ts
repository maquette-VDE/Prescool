import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnnonceService } from '../../annonces/annonce.service';
import {
  EvenementsService,
  UserWeeklyStats,
} from '../../services/evenements/evenements-service';
import { UserService } from '../../services/planning/user.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.scss'],
})
export class UserDashboard implements OnInit {
  private annonceService = inject(AnnonceService);
  private evenementsService = inject(EvenementsService);
  private userService = inject(UserService);
  currentUser = signal<any>(JSON.parse(localStorage.getItem('user') || 'null'));

  annonces = this.annonceService.getAnnonces();

  loading = signal(true);

  todayStatus = signal('Aucun pointage');

  hasPointedToday = signal(false);

  currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  firstName = computed(() => {
    const user = this.currentUser();

    return (
      user?.first_name ||
      user?.firstname ||
      user?.prenom ||
      user?.name ||
      'Utilisateur'
    );
  });

  statusLabel = computed(() => this.todayStatus() || 'Aucun pointage');

  statusClass = computed(() => {
    const status = (this.todayStatus() || '').toLowerCase();

    if (status.includes('présent') || status.includes('present')) {
      return 'status-present';
    }

    if (status.includes('retard')) {
      return 'status-late';
    }

    if (status.includes('absent')) {
      return 'status-absent';
    }

    if (status.includes('mission')) {
      return 'status-mission';
    }

    if (status.includes('télétravail') || status.includes('teletravail')) {
      return 'status-remote';
    }

    return 'status-empty';
  });

  presentThisWeek = signal(0);
  absentThisWeek = signal(0);
  lateThisWeek = signal(0);
  excusedThisWeek = signal(0);
  remoteThisWeek = signal(0);
  enMissionThisWeek = signal(0);

  presentLikeThisWeek = computed(
    () =>
      this.presentThisWeek() +
      this.lateThisWeek() +
      this.remoteThisWeek() +
      this.enMissionThisWeek(),
  );

  totalWeek = computed(
    () =>
      this.presentThisWeek() +
      this.absentThisWeek() +
      this.lateThisWeek() +
      this.excusedThisWeek() +
      this.remoteThisWeek() +
      this.enMissionThisWeek(),
  );

  attendanceRate = computed(() => {
    const total = this.totalWeek();

    if (total === 0) {
      return 0;
    }

    return Math.round((this.presentLikeThisWeek() / total) * 100);
  });

  recentActivities = computed(() => {
    const late = this.lateThisWeek();
    const absent = this.absentThisWeek();
    const present = this.presentThisWeek();

    return [
      {
        icon: 'check_circle',
        type: 'success',
        title:
          present > 0
            ? `${present} présence(s) cette semaine`
            : 'Aucune présence cette semaine',
        subtitle:
          present > 0
            ? 'Suivi de présence actif'
            : 'Aucun pointage présent enregistré',
      },
      {
        icon: 'schedule',
        type: late >= 2 ? 'danger' : late === 1 ? 'warning' : 'success',
        title:
          late >= 2
            ? `${late} retards cette semaine`
            : late === 1
              ? '1 retard cette semaine'
              : 'Aucun retard cette semaine',
        subtitle:
          late >= 2
            ? 'Attention, fréquence élevée'
            : late === 1
              ? 'À surveiller'
              : 'Très bon suivi',
      },
      {
        icon: 'cancel',
        type: absent >= 2 ? 'danger' : absent === 1 ? 'warning' : 'success',
        title:
          absent >= 2
            ? `${absent} absences cette semaine`
            : absent === 1
              ? '1 absence cette semaine'
              : 'Aucune absence cette semaine',
        subtitle:
          absent >= 2
            ? 'Situation à surveiller'
            : absent === 1
              ? 'Absence enregistrée'
              : 'Bonne régularité',
      },
    ];
  });

  markAttendance(attendanceStatus: 'present' | 'late' | 'absent'): void {
    const userId = this.currentUser()?.id;

    if (!userId || this.hasPointedToday()) {
      return;
    }

    const now = new Date().toISOString();

    this.evenementsService
      .createEvent({
        user_id: userId,
        title: 'Pointage',
        start_time: now,
        end_time: now,
        event_type: 'presence',
        attendance_status: attendanceStatus,
        status: 'scheduled',
        source: 'manual',
        all_day: false,
      })
      .subscribe({
        next: () => {
          let label = 'Présent';

          if (attendanceStatus === 'late') {
            label = 'En retard';
          }

          if (attendanceStatus === 'absent') {
            label = 'Absent';
          }

          this.todayStatus.set(label);

          this.hasPointedToday.set(true);

          if (attendanceStatus === 'present') {
            this.presentThisWeek.update((v) => v + 1);
          }

          if (attendanceStatus === 'late') {
            this.lateThisWeek.update((v) => v + 1);
          }

          if (attendanceStatus === 'absent') {
            this.absentThisWeek.update((v) => v + 1);
          }
        },
        error: (error) => {
          console.error('Erreur pointage :', error);
        },
      });
  }

  ngOnInit(): void {
    this.userService.getUserMe().subscribe({
      next: (user) => {
        this.currentUser.set(user);

        const userId = user.id;

        this.loadTodayStatus(userId);
        this.loadWeeklyStats(userId);
      },
      error: (error) => {
        console.error('Erreur profil utilisateur :', error);
        this.loading.set(false);
      },
    });
  }

  private loadTodayStatus(userId: number): void {
    this.evenementsService.getMyTodayStatus(userId).subscribe({
      next: (status: string) => {
        const finalStatus = status || 'Aucun pointage';

        this.todayStatus.set(finalStatus);

        this.hasPointedToday.set(
          finalStatus.toLowerCase() !== 'aucun pointage',
        );
      },
      error: (error) => {
        console.error('Erreur stats utilisateur :', error);
        this.todayStatus.set('Aucun pointage');
        this.loading.set(false);
      },
    });
  }

  private loadWeeklyStats(userId: number): void {
    this.evenementsService.getMyWeeklyStats(userId).subscribe({
      next: (stats: UserWeeklyStats) => {
        this.presentThisWeek.set(stats?.present ?? 0);
        this.absentThisWeek.set(stats?.absent ?? 0);
        this.lateThisWeek.set(stats?.late ?? 0);
        this.excusedThisWeek.set(stats?.excused ?? 0);
        this.remoteThisWeek.set(stats?.remote ?? 0);
        this.enMissionThisWeek.set(stats?.enMission ?? 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur stats utilisateur :', error);
        this.loading.set(false);
      },
    });
  }
}
