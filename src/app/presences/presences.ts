import {
  Component,
  ViewChild,
  AfterViewInit,
  signal,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {
  DayPilot,
  DayPilotModule,
  DayPilotMonthComponent,
  DayPilotCalendarComponent,
} from '@daypilot/daypilot-lite-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import {
  PresencesService,
  ApiEvent,
  CreateEventPayload,
  UpdateEventPayload,
} from '../services/presences/presences-service';
import { UserService } from '../services/planning/user.service';


type PresenceStatus = 'present' | 'absent' | 'late';
type CalendarView   = 'month' | 'week';

interface PresenceEvent {
  id: string;
  apiId?: number;
  date: string;
  status: PresenceStatus;
  reason?: string;
  lateTime?: string;
  depart?: boolean;
  heureDepart?: string;
}

interface StatusModalState {
  isOpen: boolean;
  selectedDate: string | null;
  selectedStatus: PresenceStatus | null;
  reason: string;
  lateTime: string;
  depart: boolean;
  heureDepart: string;
}

const STATUS_COLORS: Record<PresenceStatus, { bg: string; border: string; text: string }> = {
  present: { bg: '#d1fae5', border: '#059669', text: '#065f46' },
  absent:  { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d' },
  late:    { bg: '#fef9c3', border: '#ca8a04', text: '#713f12' },
};

const STATUS_ICON:  Record<PresenceStatus, string> = { present: '✓', absent: '✕', late: '⏱' };
const STATUS_LABEL: Record<PresenceStatus, string> = {
  present: 'Présent(e)',
  absent:  'Absent(e)',
  late:    'En retard',
};

function buildLabel(e: PresenceEvent): string {
  let label = `${STATUS_ICON[e.status]} ${STATUS_LABEL[e.status]}`;
  if (e.status === 'late'    && e.lateTime)                label += ` — ${e.lateTime}`;
  if (e.status === 'present' && e.depart && e.heureDepart) label += ` — départ ${e.heureDepart}`;
  if (e.reason)                                            label += ` : ${e.reason}`;
  return label;
}

function toDayPilotEvent(e: PresenceEvent): DayPilot.EventData {
  const c = STATUS_COLORS[e.status];
  return {
    id:          e.id,
    text:        buildLabel(e),
    start:       e.date,
    end:         new DayPilot.Date(e.date).addDays(1).toString(),
    backColor:   c.bg,
    borderColor: c.border,
    fontColor:   c.text,
    barColor:    c.border,
    toolTip:     buildLabel(e),
  };
}

function fromApiEvent(api: ApiEvent): PresenceEvent {
  const notes   = api.notes ?? '';
  const parsed  = parseNotes(notes);

  return {
    id:          String(api.id),
    apiId:       api.id,
    date:        PresencesService.toDateStr(api.start_time),
    status:      api.attendance_status,
    reason:      parsed['reason'],
    lateTime:    parsed['lateTime'],
    depart:      parsed['depart'] === 'true',
    heureDepart: parsed['heureDepart'],
  };
}

function buildNotes(
  reason?: string,
  lateTime?: string,
  depart?: boolean,
  heureDepart?: string,
): string {
  const parts: string[] = [];
  if (reason)      parts.push(`reason=${reason}`);
  if (lateTime)    parts.push(`lateTime=${lateTime}`);
  if (depart)      parts.push(`depart=true`);
  if (heureDepart) parts.push(`heureDepart=${heureDepart}`);
  return parts.join('|');
}

function parseNotes(notes: string): Record<string, string> {
  const result: Record<string, string> = {};
  notes.split('|').forEach(part => {
    const [k, v] = part.split('=');
    if (k && v) result[k.trim()] = v.trim();
  });
  return result;
}

@Component({
  selector: 'app-presences',
  standalone: true,
  imports: [CommonModule, DayPilotModule, FormsModule],
  templateUrl: './presences.html',
  styleUrl: './presences.css',
  encapsulation: ViewEncapsulation.None,
})
export class Presences implements OnInit, AfterViewInit, OnDestroy {

  private readonly presencesService = inject(PresencesService);
  private readonly userService      = inject(UserService);
  private readonly destroy$         = new Subject<void>();

  @ViewChild('month') monthComponent!: DayPilotMonthComponent;
  @ViewChild('week')  weekComponent!:  DayPilotCalendarComponent;

  currentView: CalendarView = 'month';
  isLoading = false;
  errorMsg: string | null = null;

  private currentUserId = 0;
  private navDate       = signal<DayPilot.Date>(DayPilot.Date.today());
  private events: PresenceEvent[] = [];

  readonly today = new Date();
  get dayOfMonth() { return this.today.getDate(); }
  get monthName()  { return this.today.toLocaleDateString('fr-FR', { month: 'long' }); }
  get monthAbbr()  { return this.today.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(); }
  get yearName()   { return this.today.getFullYear(); }

  get periodLabel(): string {
    const d = this.navDate();
    if (this.currentView === 'month') {
      const first = d.firstDayOfMonth();
      const last  = d.lastDayOfMonth();
      return `${first.toString('d MMM yyyy', 'fr-fr')} – ${last.toString('d MMM yyyy', 'fr-fr')}`;
    }
    const monday = d.firstDayOfWeek(1);
    return `${monday.toString('d MMM yyyy', 'fr-fr')} – ${monday.addDays(4).toString('d MMM yyyy', 'fr-fr')}`;
  }

  get periodNavLabel(): string {
    const d = this.navDate();
    if (this.currentView === 'month') {
      const label = d.toString('MMMM yyyy', 'fr-fr');
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    const monday = d.firstDayOfWeek(1);
    return `${monday.toString('d', 'fr-fr')} – ${monday.addDays(4).toString('d MMM', 'fr-fr')}`;
  }

  private get dateRange(): { from: string; to: string } {
    const d = this.navDate();
    if (this.currentView === 'month') {
      return {
        from: d.firstDayOfMonth().toString('yyyy-MM-dd'),
        to:   d.lastDayOfMonth().toString('yyyy-MM-dd'),
      };
    }
    const monday = d.firstDayOfWeek(1);
    return {
      from: monday.toString('yyyy-MM-dd'),
      to:   monday.addDays(4).toString('yyyy-MM-dd'),
    };
  }

  monthConfig = signal<DayPilot.MonthConfig>({
    locale:      'fr-fr',
    startDate:   DayPilot.Date.today(),
    eventHeight: 30,
 
    onTimeRangeSelected: (args) => this.openStatusModal(args.start.toString('yyyy-MM-dd')),
    onEventClick: (args) => {
      const ev = this.events.find(e => e.id === String(args.e.id()));
      if (ev) this.openDeleteModal(ev.id, buildLabel(ev));
    },
    onBeforeEventRender: (args) => {
      const ev = this.events.find(e => e.id === String(args.data.id));
      if (!ev) return;
      const c = STATUS_COLORS[ev.status];
      args.data.backColor   = c.bg;
      args.data.borderColor = c.border;
      args.data.fontColor   = c.text;
    },
    onBeforeCellRender: (args) => {
      const day = args.cell.start.getDayOfWeek();
      if (day === 0 || day === 6) {
        args.cell.properties.business  = false;
        args.cell.properties.backColor = '#bd0f0f';
      }
    },
  });

  weekConfig = signal<DayPilot.CalendarConfig>({
    locale:             'fr-fr',
    viewType:           'Week',
    startDate:          DayPilot.Date.today().firstDayOfWeek(1),
    heightSpec:         'BusinessHoursNoScroll',
    businessBeginsHour: 8,
    businessEndsHour:   19,
    onTimeRangeSelected: (args) => this.openStatusModal(args.start.toString('yyyy-MM-dd')),
    onEventClick: (args) => {
      const ev = this.events.find(e => e.id === String(args.e.id()));
      if (ev) this.openDeleteModal(ev.id, buildLabel(ev));
    },
    onBeforeEventRender: (args) => {
      const ev = this.events.find(e => e.id === String(args.data.id));
      if (!ev) return;
      const c = STATUS_COLORS[ev.status];
      args.data.backColor   = c.bg;
      args.data.borderColor = c.border;
      args.data.fontColor   = c.text;
    },
  });

  isFilterMode  = false;
  filterStatus: string = '';

  statusModal: StatusModalState = {
    isOpen: false,
    selectedDate: null,
    selectedStatus: null,
    reason: '',
    lateTime: '09:00',
    depart: false,
    heureDepart: '15:00',
  };

  deleteModal = { isOpen: false, eventId: '', eventTitle: '' };

  ngOnInit(): void {
    this.userService.getUserMe()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUserId = user.id;
          this.loadEvents();
        },
        error: () => this.errorMsg = 'Impossible de charger le profil utilisateur.',
      });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEvents(): void {
    if (!this.currentUserId) return;

    this.isLoading = true;
    this.errorMsg  = null;

    const { from, to } = this.dateRange;

    this.presencesService
      .getMyEvents(this.currentUserId, from, to, this.filterStatus || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apiEvents) => {
          console.log('API Events:', apiEvents);
          this.events    = apiEvents.map(fromApiEvent);
          this.isLoading = false;
          setTimeout(() => this.refreshCalendar(), 0);
        },
        error: () => {
          this.errorMsg  = 'Erreur lors du chargement des présences.';
          this.isLoading = false;
        },
      });
  }

  private refreshCalendar(): void {
    const dpEvents = this.events.map(toDayPilotEvent);
    if (this.currentView === 'month' && this.monthComponent?.control) {
      this.monthComponent.control.update({ events: dpEvents });
    }
    if (this.currentView === 'week' && this.weekComponent?.control) {
      this.weekComponent.control.update({ events: dpEvents });
    }
  }

  switchView(view: CalendarView): void {
    this.currentView = view;
    setTimeout(() => {
      this.loadEvents();
    }, 0);
  }

  navigate(step: number): void {
    const current = this.navDate();
    if (this.currentView === 'month') {
      const newDate = current.addMonths(step);
      this.navDate.set(newDate);
      this.monthConfig.update(c => ({ ...c, startDate: newDate }));
    } else {
      const newDate = current.addDays(step * 7);
      this.navDate.set(newDate);
      this.weekConfig.update(c => ({ ...c, startDate: newDate.firstDayOfWeek(1) }));
    }
    this.loadEvents();
  }

  goToToday(): void {
    const today = DayPilot.Date.today();
    this.navDate.set(today);
    this.monthConfig.update(c => ({ ...c, startDate: today }));
    this.weekConfig.update(c  => ({ ...c, startDate: today.firstDayOfWeek(1) }));
    this.loadEvents();
  }

  openCreateDialog(): void {
    this.openStatusModal(new DayPilot.Date().toString('yyyy-MM-dd'));
  }

  openStatusModal(dateStr: string | null): void {
    this.isFilterMode = dateStr === null;
    this.statusModal = {
      isOpen: true,
      selectedDate: dateStr,
      selectedStatus: null,
      reason: '',
      lateTime: '09:00',
      depart: false,
      heureDepart: '15:00',
    };
  }

  closeStatusModal(): void { this.statusModal.isOpen = false; }

  selectStatus(status: PresenceStatus): void {
    this.statusModal.selectedStatus = status;
  }

  applyFilter(status: string): void {
    this.filterStatus = status;
    this.closeStatusModal();
    this.loadEvents();
  }

  confirmStatus(): void {
    if (!this.statusModal.selectedStatus) return;

    if (this.isFilterMode) {
      this.applyFilter(this.statusModal.selectedStatus);
      return;
    }

    if (!this.statusModal.selectedDate) return;

    const status      = this.statusModal.selectedStatus;
    const date        = this.statusModal.selectedDate;
    const notes       = buildNotes(
      this.statusModal.reason || undefined,
      status === 'late'    ? this.statusModal.lateTime    : undefined,
      status === 'present' ? this.statusModal.depart      : undefined,
      status === 'present' ? this.statusModal.heureDepart : undefined,
    );

    const existing = this.events.find(e => e.date === date);

    if (existing?.apiId) {
      const payload: UpdateEventPayload = {
        attendance_status: status,
        start_time:        PresencesService.toStartISO(date),
        end_time:          PresencesService.toEndISO(date),
        all_day:           true,
        event_type:        'presence',
        notes,
      };

      this.isLoading = true;
      this.presencesService.updateEvent(existing.apiId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next:  () => { this.isLoading = false; this.loadEvents(); },
          error: () => { this.isLoading = false; this.errorMsg = 'Erreur lors de la mise à jour.'; },
        });

    } else {
      const payload: CreateEventPayload = {
        user_id:           this.currentUserId,
        title:             STATUS_LABEL[status],
        start_time:        PresencesService.toStartISO(date),
        end_time:          PresencesService.toEndISO(date),
        event_type:        'presence',
        all_day:           true,
        status:            'scheduled',
        attendance_status: status,
        notes,
        source:            'manual',
      };

      this.isLoading = true;
      this.presencesService.createEvent(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next:  () => { this.isLoading = false; this.loadEvents(); },
          error: () => { this.isLoading = false; this.errorMsg = 'Erreur lors de la création.'; },
        });
    }

    this.closeStatusModal();
  }

  openDeleteModal(id: string, title: string): void {
    this.deleteModal = { isOpen: true, eventId: id, eventTitle: title };
  }

  closeDeleteModal(): void { this.deleteModal.isOpen = false; }

  confirmDelete(): void {
    const ev = this.events.find(e => e.id === this.deleteModal.eventId);
    if (!ev?.apiId) { this.closeDeleteModal(); return; }

    this.isLoading = true;
    this.presencesService.deleteEvent(ev.apiId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  () => { this.isLoading = false; this.loadEvents(); },
        error: () => { this.isLoading = false; this.errorMsg = 'Erreur lors de la suppression.'; },
      });

    this.closeDeleteModal();
  }
}
