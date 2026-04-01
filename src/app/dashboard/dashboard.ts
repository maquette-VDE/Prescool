import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AnnonceService } from '../annonces/annonce.service';
import { UsersApiResponse } from '../interfaces/userItem';
import { UsersService } from '../services/users/users-service';

const EMPTY_USERS_RESPONSE: UsersApiResponse = {
  items: [],
  total: 0,
  page: 0,
  limit: 1,
  pages: 0,
  links: {
    first: '',
  },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  private annonceService = inject(AnnonceService);
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);

  annonces = this.annonceService.getAnnonces();

  private dashboardRouteData = toSignal(this.route.data);


  consultantsResponse = computed(
    () => this.dashboardRouteData()?.['consultants'] as UsersApiResponse
  );

  consultantsTotal = computed(() => this.consultantsResponse()?.total ?? 0);

  presentResponse = toSignal(
    this.usersService.getUsersByAttendanceStatus('present'),
    { initialValue: EMPTY_USERS_RESPONSE }
  );

  absentResponse = toSignal(
    this.usersService.getUsersByAttendanceStatus('absent'),
    { initialValue: EMPTY_USERS_RESPONSE }
  );

  lateResponse = toSignal(
    this.usersService.getUsersByAttendanceStatus('late'),
    { initialValue: EMPTY_USERS_RESPONSE }
  );

  stats = computed(() => [
    { title: 'Consultants', value: this.consultantsTotal() },
    { title: 'Présents aujourd’hui', value: this.presentResponse()?.total ?? 0 },
    { title: 'Absents aujourd’hui', value: this.absentResponse()?.total ?? 0 },
    { title: 'En retard', value: this.lateResponse()?.total ?? 0 },
    { title: 'Annonces', value: this.annonces().length }
  ]);
}