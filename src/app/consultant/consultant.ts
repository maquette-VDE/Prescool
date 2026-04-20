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

@Component({
  selector: 'app-consultant',
  standalone: true,
  imports: [],
  templateUrl: './consultant.html',
  styleUrl: './consultant.css',
})
export class Consultant
  extends RouterPagination<UsersApiResponse, UserItem>
  implements OnInit
{
  private usersService = inject(UsersService);

  private consultantQueryParams = toSignal(this.route.queryParams);

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
  }

  ngOnInit(): void {
    const status = this.route.snapshot.queryParamMap.get('status') as
      | 'present'
      | 'absent'
      | 'late'
      | null;

    const page = Number(this.route.snapshot.queryParamMap.get('page')) || 0;
    const limit = Number(this.route.snapshot.queryParamMap.get('limit')) || 10;

    if (status) {
      this.usersService.getUsersByAttendanceStatus(status).subscribe({
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
  }

  // --- UI ---
  hoveredConsultantId = signal<number | null>(null);

  private readonly filterLabels: Record<string, string> = {
    present: 'Présent(e)',
    absent: 'Absent(e)',
    en_mission: 'En mission',
    late: 'En retard',
    excused: 'Excusé(e)',
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
    return event?.attendance_status ?? '';
  }

  getDisplayStatusLabel(
    userId: number,
    eventsMap: Map<number, UserEvent>,
  ): string {
    const status = this.getDisplayStatus(userId, eventsMap);
    return this.getFilterLabel(status);
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
