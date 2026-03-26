import {
  Component,
  ViewChild,
  AfterViewInit,
  signal,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  DayPilot,
  DayPilotModule,
  DayPilotMonthComponent,
  DayPilotCalendarComponent,
} from '@daypilot/daypilot-lite-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


type PresenceStatus = 'present' | 'absent' | 'late';
type CalendarView   = 'month' | 'week';

interface PresenceEvent {
  id: string;
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

const STATUS_ICON: Record<PresenceStatus, string> = {
  present: '✓',
  absent:  '✕',
  late:    '⏱',
};

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


@Component({
  selector: 'app-presences',
  standalone: true,
  imports: [CommonModule, DayPilotModule, FormsModule],
  templateUrl: './presences.html',
  styleUrl: './presences.css',
  encapsulation: ViewEncapsulation.None,
})
export class Presences implements OnInit, AfterViewInit {

  @ViewChild('month') monthComponent!: DayPilotMonthComponent;
  @ViewChild('week')  weekComponent!:  DayPilotCalendarComponent;

  currentView: CalendarView = 'month';

  private navDate = signal<DayPilot.Date>(DayPilot.Date.today());

  readonly today = new Date();
  get dayOfMonth() { return this.today.getDate(); }
  get monthName()  { return this.today.toLocaleDateString('fr-FR', { month: 'long' }); }
  get monthAbbr()  { return this.today.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(); }
  get yearName()   { return this.today.getFullYear(); }

  get periodLabel(): string {
    const d = this.navDate();
    if (this.currentView === 'month') {
      return d.toString('MMMM yyyy', 'fr-fr');
    } else {
      const monday = d.firstDayOfWeek(1);
      const friday = monday.addDays(4);
      return `${monday.toString('d MMM', 'fr-fr')} – ${friday.toString('d MMM', 'fr-fr')}`;
    }
  }

  get periodNavLabel(): string {
    const d = this.navDate();
    if (this.currentView === 'month') {
      const label = d.toString('MMMM yyyy', 'fr-fr');
      return label.charAt(0).toUpperCase() + label.slice(1);
    } else {
      const monday = d.firstDayOfWeek(1);
      const friday = monday.addDays(4);
      return `${monday.toString('d', 'fr-fr')} – ${friday.toString('d MMM', 'fr-fr')}`;
    }
  }

  private events: PresenceEvent[] = [
    { id: crypto.randomUUID(), date: '2026-03-16', status: 'absent',  reason: 'maladie' },
    { id: crypto.randomUUID(), date: '2026-03-17', status: 'present' },
    { id: crypto.randomUUID(), date: '2026-03-18', status: 'late',    lateTime: '09:30', reason: 'transport' },
    { id: crypto.randomUUID(), date: '2026-03-19', status: 'present', depart: true, heureDepart: '16:00' },
    { id: crypto.randomUUID(), date: '2026-03-24', status: 'present' },
    { id: crypto.randomUUID(), date: '2026-03-25', status: 'absent',  reason: 'congé' },
  ];

  monthConfig = signal<DayPilot.MonthConfig>({
    locale:      'fr-fr',
    startDate:   DayPilot.Date.today(),
    eventHeight: 30,
    onTimeRangeSelected: (args) => {
      this.openStatusModal(args.start.toString('yyyy-MM-dd'));
    },
    onEventClick: (args) => {
      const ev = this.events.find(e => e.id === args.e.id());
      if (ev) this.openDeleteModal(ev.id, buildLabel(ev));
    },
    onBeforeEventRender: (args) => {
      const ev = this.events.find(e => e.id === args.data.id);
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
        args.cell.properties.backColor = '#f5f5f5';
      }
    },
  });
  weekConfig = signal<DayPilot.CalendarConfig>({
    locale:       'fr-fr',
    viewType:     'Week',
    startDate:    DayPilot.Date.today().firstDayOfWeek(1),
    heightSpec:   'BusinessHoursNoScroll',
    businessBeginsHour: 8,
    businessEndsHour:   19,
    onTimeRangeSelected: (args) => {
      this.openStatusModal(args.start.toString('yyyy-MM-dd'));
    },
    onEventClick: (args) => {
      const ev = this.events.find(e => e.id === args.e.id());
      if (ev) this.openDeleteModal(ev.id, buildLabel(ev));
    },
    onBeforeEventRender: (args) => {
      const ev = this.events.find(e => e.id === args.data.id);
      if (!ev) return;
      const c = STATUS_COLORS[ev.status];
      args.data.backColor   = c.bg;
      args.data.borderColor = c.border;
      args.data.fontColor   = c.text;
    },
  });

  isFilterMode = false;

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

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.refreshCalendar();
    }

  switchView(view: CalendarView): void {
    this.currentView = view;
    setTimeout(() => this.refreshCalendar(), 0);
  }

  navigate(step: number): void {
    const current = this.navDate();
    if (this.currentView === 'month') {
      const newDate = step > 0 ? current.addMonths(1) : current.addMonths(-1);
      this.navDate.set(newDate);
      this.monthConfig.update(c => ({ ...c, startDate: newDate }));
    } else {
      const newDate = current.addDays(step * 7);
      this.navDate.set(newDate);
      this.weekConfig.update(c => ({ ...c, startDate: newDate.firstDayOfWeek(1) }));
    }
    setTimeout(() => this.refreshCalendar(), 0);
  }

  goToToday(): void {
    const today = DayPilot.Date.today();
    this.navDate.set(today);
    this.monthConfig.update(c => ({ ...c, startDate: today }));
    this.weekConfig.update(c  => ({ ...c, startDate: today.firstDayOfWeek(1) }));
    setTimeout(() => this.refreshCalendar(), 0);
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

  confirmStatus(): void {
    if (!this.statusModal.selectedStatus) return;
    if (this.isFilterMode) { this.closeStatusModal(); return; }
    if (!this.statusModal.selectedDate)   return;

    const status = this.statusModal.selectedStatus;
    const date   = this.statusModal.selectedDate;

    const idx = this.events.findIndex(e => e.date === date);

    const newEvent: PresenceEvent = {
      id:          idx >= 0 ? this.events[idx].id : crypto.randomUUID(),
      date,
      status,
      reason:      this.statusModal.reason      || undefined,
      lateTime:    status === 'late'    ? this.statusModal.lateTime    : undefined,
      depart:      status === 'present' ? this.statusModal.depart      : undefined,
      heureDepart: status === 'present' ? this.statusModal.heureDepart : undefined,
    };

    if (idx >= 0) this.events[idx] = newEvent;
    else          this.events.push(newEvent);

    this.refreshCalendar();
    this.closeStatusModal();
  }

  openDeleteModal(id: string, title: string): void {
    this.deleteModal = { isOpen: true, eventId: id, eventTitle: title };
  }

  closeDeleteModal(): void { this.deleteModal.isOpen = false; }

  confirmDelete(): void {
    this.events = this.events.filter(e => e.id !== this.deleteModal.eventId);
    this.refreshCalendar();
    this.closeDeleteModal();
  }
}
