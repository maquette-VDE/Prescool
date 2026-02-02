import {
  Component,
  ViewChild,
  AfterViewInit,
  signal,
  inject,
  OnDestroy,
  computed,
} from '@angular/core';
import {
  DayPilot,
  DayPilotModule,
  DayPilotSchedulerComponent,
} from '@daypilot/daypilot-lite-angular';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PlanningService } from '../services/planning/planning-service';
import { SchedulerUtils } from './scheduler-utils';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [DayPilotModule],
  templateUrl: './planning.html',
  styleUrls: ['./planning.css'],
})
export class Planning implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly planningService = inject(PlanningService);
  private readonly destroy$ = new Subject<void>();

  readonly profiles = signal<DayPilot.ResourceData[]>([]);
  readonly searchQuery = signal<string>('');
  readonly today = new DayPilot.Date();
  readonly currentPage = signal<number>(0);
  readonly totalPages = signal<number>(2);
  selectedStatus = signal<string>('');
  selectedSpecialty = signal<string>('');

  readonly filteredProfiles = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.profiles().filter(
      (p) =>
        p['name']?.toLowerCase().includes(query) ||
        p['tags']['code']?.toLowerCase().includes(query),
    );
  });

  @ViewChild('scheduler') scheduler!: DayPilotSchedulerComponent;

  config = signal<DayPilot.SchedulerConfig>({
    timeHeaders: [{ groupBy: 'Day', format: 'dddd d' }],
    headerHeight: 60,
    locale: 'fr-fr',
    scale: 'Day',
    startDate: DayPilot.Date.today().firstDayOfWeek(1),
    days: 5,
    rowHeaderWidth: 200,
    eventHeight: 80,
    cellWidth: 155,
    theme: 'rounded',
    onBeforeEventRender: (args) => SchedulerUtils.renderEvent(args),
    onBeforeRowHeaderRender: (args) => SchedulerUtils.renderResource(args),
  });

  translateDateToFr(date: DayPilot.Date, format: string): string {
    return date.toString(format, 'fr-fr');
  }

  ngAfterViewInit(): void {
    const data = this.route.snapshot.data['planningData'];
    console.log(data);
    this.profiles.set(data.resources);
    this.scheduler.control.update({
      resources: data.resources,
      events: data.events,
    });

    if (data.events.length > 0) {
      this.scheduler.control.scrollTo(data.events[0].start);
    }
  }

  ngAfterViewChecked() {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );

    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      if (!bootstrap.Tooltip.getInstance(tooltipTriggerEl)) {
        new bootstrap.Tooltip(tooltipTriggerEl);
      }
    });
  }

  changeWeek(step: number): void {
    this.config.update((prev) => ({
      ...prev,
      startDate: new DayPilot.Date(prev.startDate)
        .addDays(step * 7)
        .firstDayOfWeek(1),
    }));
    this.refreshData();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.refreshData();
  }

  private refreshData(): void {
    let startDate = this.config().startDate as DayPilot.Date;
    const endDate = startDate?.addDays(4);
    this.planningService
      .getUsersDayPilotData(
        this.currentPage(),
        10,
        startDate.toString(),
        endDate.toString(),
        this.searchQuery()
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.totalPages.set(data.pagination.pages);

        this.scheduler.control.update({
          resources: data.resources,
          events: data.events,
        });
      });
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages()) {
      this.currentPage.set(pageIndex);
      this.refreshData();
    }
  }

  get weekRangeLabel(): string {
    const start = new DayPilot.Date(this.config().startDate);
    const end = start.addDays(4);
    return `${start.toString('d MMM', 'fr-fr')} - ${end.toString('d MMM', 'fr-fr')}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



onStatusChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  this.selectedStatus.set(value);
  //this.currentPage.set(0); // Reset à la page 1 lors d'un filtrage
  //this.refreshData();
}

onSpecialtyChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  this.selectedSpecialty.set(value);
  //this.currentPage.set(0);
  //this.refreshData();
}
}
