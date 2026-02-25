import { computed, inject, Signal, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { UsersApiResponse } from "../../interfaces/userItem";
import { map } from "rxjs";
import { UserEvent } from "../../interfaces/events";

export abstract class RouterPagination<T> {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  protected abstract routeDataSignal: Signal<T | undefined>;

  //Signaux dérivés
  currentPage = computed(() => (this.routeDataSignal() as any)?.page ?? 0);

  pageSize = computed(() => (this.routeDataSignal() as any)?.limit ?? 10);

  totalPages = computed(() => (this.routeDataSignal() as any)?.pages ?? 0);

  // événements
  evenements = toSignal(
    this.route.data.pipe(map((data) => data['evenements'] as UserEvent[])),
    { initialValue: [] },
  );

  eventsByConsultant = computed(() => {
    const map = new Map<number, UserEvent>();
    for (const e of this.evenements()) map.set(e.user_id, e);
    return map;
  });

  goToPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page, limit: this.pageSize() },
      queryParamsHandling: 'merge',
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
}
