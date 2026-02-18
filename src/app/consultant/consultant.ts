import { Component, computed, signal } from '@angular/core';
import { UsersApiResponse } from '../interfaces/userItem';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterPagination } from '../shared/base/router-pagination.abstract';

@Component({
  selector: 'app-consultant',
  imports: [],
  templateUrl: './consultant.html',
  styleUrl: './consultant.css',
})
export class Consultant extends RouterPagination<UsersApiResponse> {
  //observable -> signal
  private consultantRouteData = toSignal(this.route.data);

  //Données paginées venant du resolver
  protected override routeDataSignal = computed(
    () => this.consultantRouteData()?.['consultants'] as UsersApiResponse,
  );


  //Signaux dérivés
  consultants = computed(() => this.routeDataSignal()?.items ?? []);

  hoveredConsultantId = signal<number | null>(null);
}
