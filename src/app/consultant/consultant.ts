import {
  Component,
  computed,
  effect,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UsersApiResponse, UserItem } from '../interfaces/userItem';
import { UserEvent } from '../interfaces/events';
import { RouterPagination } from '../shared/base/router-pagination.abstract';
import { UserRole } from '../models/userRole';
import { UsersService } from '../services/users/users-service';
import { EvenementsService } from '../services/evenements/evenements-service';

@Component({
  selector: 'app-consultant',
  standalone: true,
  imports: [],
  templateUrl: './consultant.html',
  styleUrls: ['./consultant.css'],
})
export class Consultant
  extends RouterPagination<UsersApiResponse, UserItem>
  implements OnInit
{
  private usersService = inject(UsersService);

  private consultantQueryParams = toSignal(this.route.queryParams);

  private evenementsService = inject(EvenementsService);

  eventsMap = signal<Map<number, UserEvent>>(new Map());

  loading = signal(true);

  consultantsResponse = signal<UsersApiResponse>({
    items: [],
    total: 0,
    page: 0,
    limit: 10,
    pages: 0,
    links: {
      first: '',
    },
  });

  serverStatusFilter = computed(() => {
    const status = this.consultantQueryParams()?.['status'];
    return typeof status === 'string' ? status : '';
  });

  protected override routeDataSignal = computed(() =>
    this.consultantsResponse(),
  );

  protected override allItems = computed(
    () => this.consultantsResponse().items ?? [],
  );

  // --- Filtres ---
  selectedFilters = signal<string[]>([]);

  protected override activeFilters = this.selectedFilters;

  protected override filterFn = (
    item: UserItem,
    filters: string[],
    eventsMap: Map<number, UserEvent>,
  ): boolean => {
    if (this.serverStatusFilter()) {
      return true;
    }

    const event = eventsMap.get(item.id);
    return !!event && filters.includes(event.attendance_status);
  };

  constructor() {
    super();

    effect(() => {
      const status = this.consultantQueryParams()?.['status'];

      if (!status || typeof status !== 'string') {
        this.selectedFilters.set([]);
        return;
      }

      if (
        this.selectedFilters().length !== 1 ||
        this.selectedFilters()[0] !== status
      ) {
        this.selectedFilters.set([status]);
      }
    });

    effect(() => {
      const params = this.consultantQueryParams();

      const status =
        typeof params?.['status'] === 'string' ? params['status'] : null;

      const page = Number(params?.['page']) || 0;
      const limit = Number(params?.['limit']) || 10;

      this.loading.set(true);

      if (status) {
        this.usersService
          .getUsersByAttendanceStatus(status as 'present' | 'absent' | 'late')
          .subscribe({
            next: (response) => {
              this.consultantsResponse.set(response);
              this.loading.set(false);
            },
            error: () => this.loading.set(false),
          });
        return;
      }

      const urlApi =
        `https://prez-cool-staging.appsolutions224.com/api/v1/users` +
        `?role_names=${UserRole.CONSULTANT}` +
        `&role_names=${UserRole.ETUDIANT}` +
        `&limit=${limit}` +
        `&page=${page}`;

      this.usersService.getUsers(urlApi).subscribe({
        next: (response) => {
          this.consultantsResponse.set(response);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }

  ngOnInit(): void {
    this.evenementsService.getEvenementsActifsToday().subscribe({
      next: (events) => {
        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const todayEvents = events.filter((event) => {
          const eventStart = new Date(event.start_time);
          const eventEnd = new Date(event.end_time);

          return eventStart <= endOfDay && eventEnd >= startOfDay;
        });

        const map = new Map<number, UserEvent>();

        todayEvents.forEach((event) => {
          const existing = map.get(event.user_id);

          if (!existing) {
            map.set(event.user_id, event);
            return;
          }

          const existingDate = new Date(existing.start_time).getTime();
          const currentDate = new Date(event.start_time).getTime();

          if (currentDate > existingDate) {
            map.set(event.user_id, event);
          }
        });

        this.eventsMap.set(map);
      },
      error: () => {
        this.eventsMap.set(new Map());
      },
    });
  }

  // --- UI ---
  hoveredConsultantId = signal<number | null>(null);

  private readonly filterLabels: Record<string, string> = {
    present: 'Présent(e)',
    absent: 'Absent(e)',
    en_mission: 'En mission',
    late: 'En retard',
    excused: 'Excusé(e)',
    no_event: 'Sans pointage',
  };

  getFilterLabel(value: string): string {
    return this.filterLabels[value] ?? value;
  }

  getDisplayStatus(userId: number, eventsMap: Map<number, UserEvent>): string {
    const serverStatus = this.serverStatusFilter();

    if (serverStatus) {
      return serverStatus;
    }

    const event = eventsMap.get(userId);

    if (!event) {
      return 'no_event';
    }

    return event.attendance_status;
  }

  getDisplayStatusLabel(
    userId: number,
    eventsMap: Map<number, UserEvent>,
  ): string {
    const status = this.getDisplayStatus(userId, eventsMap);
    return this.getFilterLabel(status);
  }

  toggleFilter(value: string) {
    if (!value) {
      return;
    }

    this.selectedFilters.set([value]);

    this.router.navigate([], {
      queryParams: { status: value, page: null },
      queryParamsHandling: 'merge',
    });
  }

  removeFilter(filter: string) {
    this.selectedFilters.update((prev) => prev.filter((f) => f !== filter));

    this.router.navigate([], {
      queryParams: { status: null },
      queryParamsHandling: 'merge',
    });
  }

  resetAllFilters() {
    this.selectedFilters.set([]);

    this.router.navigate([], {
      queryParams: { status: null, page: null },
      queryParamsHandling: 'merge',
    });
  }
}
