import { computed, inject, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs";
import { UserEvent } from "../../interfaces/events";

export abstract class RouterPagination<T, I> {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  protected abstract routeDataSignal: Signal<T | undefined>;

  // À fournir par chaque composant enfant
  protected abstract allItems: Signal<I[]>;
  protected abstract activeFilters: Signal<string[]>;
  protected abstract filterFn: (
    item: I,
    filters: string[],
    eventsMap: Map<number, UserEvent>
  ) => boolean;

  // Pagination depuis queryParams (server-side)
  currentPage = computed(() => (this.routeDataSignal() as any)?.page ?? 0);
  pageSize = computed(() => (this.routeDataSignal() as any)?.limit ?? 10);

  // Événements (optionnel selon la page, map vide par défaut)
  evenements = toSignal(
    this.route.data.pipe(
      map((data) => (data['evenements'] as UserEvent[]) ?? [])
    ),
    { initialValue: [] }
  );

  eventsByConsultant = computed(() => {
    const map = new Map<number, UserEvent>();
    for (const e of this.evenements()) map.set(e.user_id, e);
    return map;
  });

  // Filtrage client-side
  filteredItems = computed(() => {
    const filters = this.activeFilters();
    const items = this.allItems();
    const eventsMap = this.eventsByConsultant();

    if (filters.length === 0) return items;
    return items.filter((item) => this.filterFn(item, filters, eventsMap));
  });

  // totalPages basé sur les items filtrés si filtre actif, sinon server-side
  totalPages = computed(() => {
    const filters = this.activeFilters();

    if (filters.length === 0) {
      return (this.routeDataSignal() as any)?.pages ?? 0;
    }

    return Math.ceil(this.filteredItems().length / this.pageSize());
  });

  // Navigation
  goToPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page, limit: this.pageSize() },
      queryParamsHandling: "merge",
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  changePageSize(size: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 0, limit: size },
      queryParamsHandling: "merge",
    });
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage() - 1);
    const end = Math.min(this.totalPages() - 2, this.currentPage() + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
