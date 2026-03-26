import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AnnonceService } from '../annonces/annonce.service';
import { PresenceService } from '../services/presence.service';
import { UsersApiResponse } from '../interfaces/userItem';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  private annonceService = inject(AnnonceService);
  private presenceService = inject(PresenceService);
  private route = inject(ActivatedRoute);

  annonces = this.annonceService.getAnnonces();

  private dashboardRouteData = toSignal(this.route.data);

  consultantsResponse = computed(
    () => this.dashboardRouteData()?.['consultants'] as UsersApiResponse
  );

  consultantsTotal = computed(() => this.consultantsResponse()?.total ?? 0);

  stats = computed(() => [
    { title: 'Consultants', value: this.consultantsTotal() },
    { title: 'Présents aujourd’hui', value: this.presenceService.presentCountToday() },
    { title: 'Absents aujourd’hui', value: this.presenceService.absentCountToday() },
    { title: 'En retard', value: this.presenceService.lateCountToday() },
    { title: 'Annonces', value: this.annonces().length }
  ]);
}