import { Component, computed, inject, signal } from '@angular/core';
import { UserItem, UsersApiResponse } from '../interfaces/userItem';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { UserEvent } from '../interfaces/events';
import { effect } from '@angular/core';

@Component({
  selector: 'app-consultant',
  imports: [],
  templateUrl: './consultant.html',
  styleUrl: './consultant.css',
})
export class Consultant {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  //observable -> signal
  private consultantRouteData = toSignal(this.route.data);

  //Données paginées venant du resolver
  consultantsData = computed(
    () => this.consultantRouteData()?.['consultants'] as UsersApiResponse
  );

  //Signaux dérivés
  consultants = computed(() => this.consultantsData()?.items ?? []);
  currentPage = computed(() => this.consultantsData()?.page ?? 0);
  pageSize = computed(() => this.consultantsData()?.limit ?? 10);
  totalPages = computed(() => this.consultantsData()?.pages ?? 0);

  evenements = toSignal(
    this.route.data.pipe(map((data) => data['evenements'] as UserEvent[])),
    { initialValue: [] },
  );

  eventsByConsultant = computed(() => {
    const map = new Map<number, UserEvent>();
    for (const e of this.evenements()) {
      map.set(e.user_id, e);
    }
    return map;
  });

  hoveredConsultantId = signal<number | null>(null);

  goToPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {page, limit: this.pageSize()},
      queryParamsHandling: 'merge'
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  constructor() {
    effect(() => {
      console.log("consultants :", this.consultants()),
      console.log("évènements :", this.evenements()),
      console.log("consultantsData :", this.consultantsData())
    })
  }
}
