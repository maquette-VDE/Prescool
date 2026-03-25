import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UsersApiResponse, UserItem } from '../interfaces/userItem';
import { UserEvent } from '../interfaces/events';
import { RouterPagination } from '../shared/base/router-pagination.abstract';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-consultant',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './consultant.html',
  styleUrl: './consultant.css',
})
export class Consultant extends RouterPagination<UsersApiResponse, UserItem> {

  // --- Données brutes ---
  private consultantRouteData = toSignal(this.route.data);

  protected override routeDataSignal = computed(
    () => this.consultantRouteData()?.['consultants'] as UsersApiResponse
  );

  // Fournir les items bruts à RouterPagination
  protected override allItems = computed(
    () => this.routeDataSignal()?.items ?? []
  );

  // --- Filtres ---
  selectedFilters = signal<string[]>([]);

  // Labels pour l'affichage
  private readonly filterLabels: Record<string, string> = {
    'present': 'Présent(e)',
    'absent': 'Absent(e)',
    'en_mission': 'En mission',
    'late': 'En retard',
    'excused': 'Excusé(e)'
  };

  // Fournir la logique de filtre à RouterPagination
  protected override filterFn = (
    item: UserItem,
    filters: string[],
    eventsMap: Map<number, UserEvent>
  ): boolean => {
    const event = eventsMap.get(item.id);
    return !!event && filters.includes(event.attendance_status);
  };

  // --- UI ---
  hoveredConsultantId = signal<number | null>(null);

  private readonly filterLabels: Record<string, string> = {
    present: 'Présent(e)',
    absent: 'Absent(e)',
    mission: 'En mission',
    late: 'En retard',
    excused: 'Excusé(e)',
  };

  getFilterLabel(value: string): string {
    return this.filterLabels[value] ?? value;
  }

  toggleFilter(value: string) {
    if (value && !this.selectedFilters().includes(value)) {
      this.selectedFilters.update((prev) => [...prev, value]);
    }
  }

  removeFilter(filter: string) {
    this.selectedFilters.update((prev) => prev.filter((f) => f !== filter));
  }

  resetAllFilters() {
    this.selectedFilters.set([]);
  }
}
