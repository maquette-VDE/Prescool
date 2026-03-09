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

  selectedFilter = signal<string | null>(null);

  filteredConsultants = computed(() => {
    const filter = this.selectedFilter();
    const consultantsToDispaly = this.consultants();
    const eventsMap = this.eventsByConsultant();

    if (!filter) {
      return consultantsToDispaly;
    }

    return consultantsToDispaly.filter(c => {
      const event = eventsMap.get(c.id)
      return event?.attendance_status === filter;
    });
  });

  hoveredConsultantId = signal<number | null>(null);

  changePageSize(size: number): void {
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: { page: 0, limit: size },
    queryParamsHandling: 'merge',
    });
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage() - 1);
    const end = Math.min(this.totalPages() - 2, this.currentPage() + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
