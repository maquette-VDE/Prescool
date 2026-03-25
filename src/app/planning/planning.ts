import {
  Component,
  ViewChild,
  AfterViewInit,
  signal,
  inject,
  OnInit,
  OnDestroy,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import {
  DayPilot,
  DayPilotModule,
  DayPilotSchedulerComponent,
} from '@daypilot/daypilot-lite-angular';
import { Subject } from 'rxjs';
import { SchedulerUtils } from './scheduler-utils';
import { PlanningData } from '../resolvers/planning/planning-resolver';
import { HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/planning/user.service';
import { RouterPagination } from '../shared/base/router-pagination.abstract';
import { UserEvent } from '../interfaces/events';
import { Speciality } from '../interfaces/speciality';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import * as bootstrap from 'bootstrap';

export enum events_status {
  present  = 'Present(e)',
  absent   = 'Absent(e)',
  excused  = 'Excusé(e)',
  late     = 'En retard',
  mission  = 'En mission',
  remote   = 'En télétravail',
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, DayPilotModule, FormsModule],
  templateUrl: './planning.html',
  styleUrls: ['./planning.css'],
})
export class Planning
  extends RouterPagination<PlanningData, DayPilot.ResourceData>
  implements AfterViewInit, OnInit, OnDestroy
{
  private readonly destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);

  private planningRouteData = toSignal(
    this.route.data.pipe(map((data) => data['planningData'] as PlanningData))
  );

  protected override routeDataSignal = computed(
    () => this.planningRouteData() as any
  );

  protected override allItems = computed(
    () => this.planningRouteData()?.resources ?? []
  );

  selectedSpecialty = signal<string>('');
  selectedStatus    = signal<string>('');

  protected override activeFilters = signal<string[]>([]);

  protected override filterFn = (
    _resource: DayPilot.ResourceData,
    _filters: string[],
    _eventsMap: Map<number, UserEvent>
  ): boolean => true;

  readonly today       = new DayPilot.Date();
  readonly specialties = signal<Speciality[]>([]);
  EVENT_STATUS = events_status;
  statusList   = Object.entries(this.EVENT_STATUS);

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
    const data = this.route.snapshot.data['planningData'] as PlanningData;
    this.specialties.set(data.specialties);
    this.scheduler.control.update({
      resources: data.resources,
      events: data.events,
    });
    if (data.events.length > 0) {
      this.scheduler.control.scrollTo(data.events[0].start);
    }
  }

  ngAfterViewChecked() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => {
      if (!bootstrap.Tooltip.getInstance(el)) new bootstrap.Tooltip(el);
    });
  }

  private lastDataVersion: PlanningData | undefined;

  ngOnInit() {
    this.userService.getUserMe().subscribe({
      next: (data) => (this.currentUser = data),
      error: (err) => console.error('Erreur chargement', err),
    });

    this.route.data.subscribe((data) => {
      const planningData = data['planningData'] as PlanningData;

      // 👇 LOG TEMPORAIRE — à retirer après debug
      console.log('planningData complet:', planningData);

      if (planningData && planningData !== this.lastDataVersion) {
        this.lastDataVersion = planningData;
        this.specialties.set(planningData.specialties);
        if (this.scheduler?.control) {
          this.scheduler.control.update({
            resources: planningData.resources,
            events: planningData.events,
          });
        }
      }
    });
  }

  changeWeek(step: number): void {
    const newStart = new DayPilot.Date(this.config().startDate)
      .addDays(step * 7)
      .firstDayOfWeek(1);

    this.config.update((prev) => ({ ...prev, startDate: newStart }));

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 0,
        limit: this.pageSize(),
        startFrom: newStart.toString(),
        startTo: newStart.addDays(4).toString(),
      },
      queryParamsHandling: 'merge',
    });
  }

  onEventStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 0, limit: this.pageSize(), status: value || null },
      queryParamsHandling: 'merge',
    });
  }

  onSpecialtyChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSpecialty.set(value);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 0, limit: this.pageSize(), specialty: value || null },
      queryParamsHandling: 'merge',
    });
  }

  get weekRangeLabel(): string {
    const start = new DayPilot.Date(this.config().startDate);
    const end   = start.addDays(4);
    return `${start.toString('d MMM', 'fr-fr')} - ${end.toString('d MMM', 'fr-fr')}`;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.user-pill')) this.isMenuOpen = false;
  }

  public isMenuOpen   = false;
  public currentUser: any = { first_name: '', last_name: '', email: '', phone_number: '', is_active: true };
  public visibleCreate   = false;
  public imagePreview: string | ArrayBuffer | null = null;
  isUpdating  = false;
  showSuccess = false;
  showError   = false;

  constructor(private userService: UserService) {
    super();
  }

  get userInitials(): string {
    const p = this.currentUser?.first_name || '';
    return (p.charAt(0) + p.charAt(1)).toUpperCase() || '??';
  }

  saveProfile() {
    const profileData = {
      first_name:   this.currentUser.first_name,
      last_name:    this.currentUser.last_name,
      email:        this.currentUser.email,
      phone_number: this.currentUser.phone_number || '',
      is_active:    true,
    };
    this.userService.updateUserMe(profileData).subscribe({
      next: () => { this.isUpdating = false; this.showSuccess = true; this.closeWithDelay(); },
      error: () => { this.isUpdating = false; this.showError   = true; this.closeWithDelay(); },
    });
  }

  private closeWithDelay() {
    setTimeout(() => {
      this.visibleCreate = false;
      this.showSuccess   = false;
      this.showError     = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  toggleCreateModal() {
    this.visibleCreate = !this.visibleCreate;
    if (!this.visibleCreate) this.imagePreview = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(input.files[0]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Surcharge pour adapter la structure PlanningData
override totalPages = computed(() => 
  this.planningRouteData()?.pagination?.pages ?? 0
);

override currentPage = computed(() =>
  this.planningRouteData()?.page ?? 0
);
}