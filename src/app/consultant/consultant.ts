import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UsersApiResponse } from '../interfaces/userItem';
import { RouterPagination } from '../shared/base/router-pagination.abstract';

@Component({
  selector: 'app-consultant',
  standalone: true,
  imports: [],
  templateUrl: './consultant.html',
  styleUrl: './consultant.css',
})
export class Consultant extends RouterPagination<UsersApiResponse> {
  // --- Données et Signaux de base ---
  private consultantRouteData = toSignal(this.route.data);

  protected override routeDataSignal = computed(
    () => this.consultantRouteData()?.['consultants'] as UsersApiResponse,
  );

  consultants = computed(() => this.routeDataSignal()?.items ?? []);
  
  // --- Gestion des Filtres (Tableau pour multi-sélection) ---
  selectedFilters = signal<string[]>([]);

  // Labels pour l'affichage
  private readonly filterLabels: Record<string, string> = {
    'present': 'Présent(e)',
    'absent': 'Absent(e)',
    'mission': 'En mission',
    'late': 'En retard',
    'excused': 'Excusé(e)'
  };

  // --- Logique de filtrage ---
  filteredConsultants = computed(() => {
    const activeFilters = this.selectedFilters();
    const allConsultants = this.consultants();
    const eventsMap = this.eventsByConsultant();

    if (activeFilters.length === 0) return allConsultants;

    return allConsultants.filter(c => {
      const event = eventsMap.get(c.id);
      return event && activeFilters.includes(event.attendance_status);
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
  
  // --- Méthodes d'action ---
  getFilterLabel(value: string): string {
    return this.filterLabels[value] ?? value;
  }

  toggleFilter(value: string) {
    if (value && !this.selectedFilters().includes(value)) {
      this.selectedFilters.update(prev => [...prev, value]);
    }
  }

  removeFilter(filterToRemove: string, event?: Event) {
    event?.stopPropagation();
    this.selectedFilters.update(prev => prev.filter(f => f !== filterToRemove));
  }

  resetAllFilters() {
    this.selectedFilters.set([]);
  }
}
