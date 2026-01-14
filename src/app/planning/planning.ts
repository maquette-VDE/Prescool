import { Component, ViewChild, AfterViewInit, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { DayPilot, DayPilotModule, DayPilotSchedulerComponent } from '@daypilot/daypilot-lite-angular';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Profile } from '../interfaces/profile';
import { PlanningService } from '../services/planning/planning-service';
import { SchedulerUtils } from './scheduler-utils';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [DayPilotModule],
  templateUrl: './planning.html',
  styleUrls: ['./planning.css'],
})
export class Planning implements OnInit, AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly planningService = inject(PlanningService);
  private readonly destroy$ = new Subject<void>();

  readonly profiles = signal<Profile[]>([]);
  readonly searchQuery = signal<string>('');
  readonly today = new DayPilot.Date();
  
  readonly filteredProfiles = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.profiles().filter(p => 
      p.ressource.title.toLowerCase().includes(query) || 
      p.ressource.id.toLowerCase().includes(query)
    );
  });

  @ViewChild('scheduler') scheduler!: DayPilotSchedulerComponent;

  config = signal<DayPilot.SchedulerConfig>({
    timeHeaders : [
      { groupBy: 'Day', format: 'dddd d'},
    ],
    headerHeight: 60,
    locale: 'fr-fr',
    scale: 'Day',
    startDate: DayPilot.Date.today().firstDayOfWeek(1),
    days: 5,
    rowHeaderWidth: 200,
    eventHeight: 80,
    cellWidth: 220,
    theme: 'rounded',
    onBeforeEventRender: (args) => SchedulerUtils.renderEvent(args),
    onBeforeRowHeaderRender: (args) => SchedulerUtils.renderResource(args),
  });

  ngOnInit(): void {
    this.route.data
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        const profiles = data['profiles'] as Profile[];
        this.profiles.set(profiles);
        this.refreshData();
      });
  }

  translateDateToFr(date: DayPilot.Date, format: string): string {
    return date.toString(format, 'fr-fr');
  }

  ngAfterViewInit(): void {
    this.refreshData();
  }

  changeWeek(step: number): void {
    this.config.update(prev => ({
      ...prev,
      startDate: new DayPilot.Date(prev.startDate).addDays(step * 7).firstDayOfWeek(1)
    }));
    this.refreshData();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.refreshData();
  }

  private refreshData(): void {
    const resources = this.filteredProfiles().map(p => ({
      id: p.ressource.id,
      name: p.ressource.title,
    }));

    this.planningService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(events => {
        this.scheduler.control.update({ resources, events });
      });
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
}