import {
  Component,
  ViewChild,
  AfterViewInit,
  signal,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  DayPilot,
  DayPilotModule,
  DayPilotSchedulerComponent,
} from '@daypilot/daypilot-lite-angular';
import { Profile } from '../interfaces/profile';
import { ActivatedRoute } from '@angular/router';
import { map, takeUntil, Subject } from 'rxjs';
import { PlanningService } from '../services/planning/planning-service';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [DayPilotModule],
  templateUrl: './planning.html',
  styleUrls: ['./planning.css'],
})
export class Planning implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private planningService = inject(PlanningService);
  private destroy$ = new Subject<void>();

  today = new DayPilot.Date();

  @ViewChild('scheduler') scheduler!: DayPilotSchedulerComponent;

  eventTypes = [
    { name: 'Présent', id: 'presence', color: '#6BB346', textColor: '#3CAA04' },
    { name: 'Absent', id: 'absence', color: '#B31F24', textColor: '#B31F24' },
    { name: 'En retard', id: 'retard', color: '#F78404', textColor: '#F78404' },
  ];
  goToPreviousWeek(): void {
    const currentStart = new DayPilot.Date(this.config().startDate);
    this.config.update((prev) => ({
      ...prev,
      startDate: currentStart.addDays(-7),
    }));
  }

  translateDateToFr(date: DayPilot.Date, format: string): string {
    return date.toString(format, 'fr-fr');
  }

  goToNextWeek(): void {
    const currentStart = new DayPilot.Date(this.config().startDate);
    this.config.update((prev) => ({
      ...prev,
      startDate: currentStart.addDays(7),
    }));
  }

  getWeekRange(): string {
    let start = new DayPilot.Date(this.config().startDate);
    const end = start.addDays(4);

    const format = 'd MMM';
    return `${start.toString(format, 'fr-fr')} - ${end.toString(
      format,
      'fr-fr'
    )}`;
  }

  config = signal<DayPilot.SchedulerConfig>({
    timeHeaders: [{ groupBy: 'Day', format: 'dddd d', height: 50 }],
    scale: 'Day',
    startDate: DayPilot.Date.today().firstDayOfWeek(1),
    days: 5,
    locale: 'fr-fr',
    heightSpec: 'Max',
    height: 400,
    rowMarginTop: 10,
    rowMarginBottom: 10,
    rowHeaderWidth: 200,

    eventHeight: 80,
    theme: 'rounded',
    cellWidth: 220,

    headerHeight: 50,

    onTimeRangeSelected: async (args) => {
      const data = {
        start: args.start,
        end: args.end,
        resource: args.resource,
        id: DayPilot.guid(),
        text: 'Nouvelle présence',
        tags: { type: 'presence' },
      };
      const result = await this.openModal(data);
      args.control.clearSelection();
      if (result) {
        args.control.events.add(result);
      }
    },

    onEventClick: async (args) => {
      await this.editEvent(args.e);
    },

    onBeforeEventRender: (args) => {
      const type =
        this.eventTypes.find((t) => t.id === args.data.tags?.type) ??
        this.eventTypes[0];

      args.data.backColor = `${type.color}45`;
      args.data.borderColor = type.textColor;
      args.data.fontColor = type.textColor;
      args.data.cssClass = 'border-1 rounded-3 shadow-none';

      const start = new DayPilot.Date(args.data.start).toString('HH:mm');
      const end = new DayPilot.Date(args.data.end).toString('HH:mm');
      const status = args.data.tags?.type;
      const note = args.data.text;

      // Contenu HTML d'une cellule
      args.data.html = `
    <div class="d-flex flex-column align-items-center justify-content-center h-100 w-100 text-center" style="font-size: 0.85rem; line-height: 1.2; padding:2px;">
      <div class="fw-bold">
        ${status === 'absence' ? 'Absent' : `${start} - ${end}`}
      </div>

      ${note && note !== ''
          ? `
        <div class="fst-italic mt-1" style="font-size: 0.75rem; opacity: 0.9;">
          "${note}"
        </div>`
          : ''
        }
    </div>
  `;
    },

    onBeforeRowHeaderRender: (args) => {
      args.row.html = `
      <div class="d-flex align-items-center p-2">
        <div class="rounded-circle me-3" style="width: 35px; height: 35px; border: 0px solid; background-color: #F1F1F1;"></div>
        <div class="d-flex flex-column">
          <span class="fw-bold text-dark" style="font-size: 0.9rem;">${args.row.name}</span>
          <span class="text-muted" style="font-size: 0.7rem;">${args.row.id}</span>
        </div>
        <i class="bi bi-phone-vibrate text-success ms-auto" style="font-size: 1.2rem;"></i>
      </div>
    `;
    },
  });

  async editEvent(e: DayPilot.Event) {
    const result = await this.openModal(e.data);
    if (result) {
      this.scheduler.control.events.update(result);
    }
  }

  async openModal(data: any) {
    const form = [
      { name: 'Titre', id: 'text', type: 'text' },
      {
        name: 'Type',
        id: 'tags.type',
        type: 'select',
        options: this.eventTypes.map((t) => ({ name: t.name, id: t.id })),
      },
      { name: 'Début', id: 'start', type: 'datetime' },
      { name: 'Fin', id: 'end', type: 'datetime' },
    ];

    const modal = await DayPilot.Modal.form(form, data);
    return modal.canceled ? null : modal.result;
  }

  ngOnInit(): void {
    this.route.data
      .pipe(
        map((data) => data['profiles'] as Profile[]),
        takeUntil(this.destroy$)
      )
      .subscribe((profiles) => {
        if (profiles) this.updateScheduler(profiles);
      });
  }

  ngAfterViewInit(): void {
    const initialProfiles = this.route.snapshot.data['profiles'];
    if (initialProfiles) this.updateScheduler(initialProfiles);
  }

  private updateScheduler(profiles: Profile[]): void {
    const resources = profiles.map((p) => ({
      id: p.ressource.id,
      name: p.ressource.title,
    }));

    this.planningService.getEvents().subscribe((events) => {
      this.scheduler.control.update({ resources, events });

      if (events.length > 0) {
        this.scheduler.control.scrollTo(events[0].start);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
