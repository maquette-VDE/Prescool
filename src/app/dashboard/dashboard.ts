import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AnnonceService } from '../annonces/annonce.service';
import { UsersApiResponse } from '../interfaces/userItem';
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


  consultantsResponse = computed(
    () => this.dashboardRouteData()?.['consultants'] as UsersApiResponse
  );

  evenements = computed(
    () => (this.dashboardRouteData()?.['evenements'] as UserEvent[]) ?? []
  );

  consultantsTotal = computed(() => this.consultantsResponse()?.total ?? 0);

  presentCount = computed(() =>
    this.evenements().filter((e) => e.attendance_status === 'present').length
  );

  absentCount = computed(() =>
    this.evenements().filter((e) => e.attendance_status === 'absent').length
  );

  lateCount = computed(() =>
    this.evenements().filter((e) => e.attendance_status === 'late').length
  );

  stats = computed(() => [
    { title: 'Consultants', value: this.consultantsTotal() },
    { title: 'Présents aujourd’hui', value: this.presentCount() },
    { title: 'Absents aujourd’hui', value: this.absentCount() },
    { title: 'En retard', value: this.lateCount() },
    { title: 'Annonces', value: this.annonces().length }
  ]);
}