import { Component, ViewEncapsulation } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'present' | 'absent' | 'late' | 'generic';
  lateTime?: string; // Heure d'arrivée si en retard
  reason?: string;   // Raison (maladie, etc.)
}

interface StatusModalState {
  isOpen: boolean;
  selectedDate: string | null;
  selectedStatus: 'present' | 'absent' | 'late' | null;
  reason: string;
  lateTime: string;
}

@Component({
  selector: 'app-presences',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, FormsModule],
  templateUrl: './presences.html',
  styleUrl: './presences.css',
  encapsulation: ViewEncapsulation.None,
})
export class Presences {

  /* ============================================================
     🎯 DONNÉES (non connectées au backend pour l’instant)
     ============================================================ */
  events: CalendarEvent[] = [
    { id: crypto.randomUUID(), title: 'Absent(e) - "maladie"', date: '2025-11-17', type: 'absent', reason: 'maladie' },
    { id: crypto.randomUUID(), title: 'Présent(e)', date: '2025-11-21', type: 'present' },
    { id: crypto.randomUUID(), title: 'En retard - "Rendez-vous France Travail"', date: '2025-11-25', type: 'late', reason: 'Rendez-vous France Travail', lateTime: '09:30' }
  ];

  searchQuery = '';
  statusModal: StatusModalState = {
    isOpen: false,
    selectedDate: null,
    selectedStatus: null,
    reason: '',
    lateTime: '09:00',
  };
  isFilterMode = false;



  /* ============================================================
     🎯 OPTIONS DU CALENDRIER
     ============================================================ */
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'fr',
    locales: [frLocale],
    firstDay: 1,

    selectable: true,
    editable: false,

    events: [],

    // IMPORTANT 🔥 création événement
    dateClick: this.onDateClick.bind(this),

    // clic simple → supprimer
    eventClick: this.onEventClick.bind(this),

    // double clic → modifier événement
    eventDidMount: (info) => {
      info.el.addEventListener('dblclick', () => {
        this.onEventDoubleClick(info.event);
      });
    },

    displayEventTime: false,
    eventDisplay: 'block',
    height: 'auto',

    // Masquer le samedi (6) et le dimanche (0)
    hiddenDays: [0, 6],

    // Noms complets des jours
    dayHeaderContent: (args) => {
      const jours = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
      return jours[args.date.getDay()];
    },
  };


  constructor() {
    this.refreshCalendar();
  }



  /* ============================================================
     🎯 MAPPING FULLCALENDAR
     ============================================================ */
  private toFCEvent(e: CalendarEvent) {
    const css = {
      present: 'event-present',
      absent: 'event-absent',
      late: 'event-late',
      generic: 'event-generic',
    }[e.type];

    // Afficher différent selon le type
    let displayTitle = e.title;
    if (e.type === 'late' && e.lateTime) {
      displayTitle = `En retard ${e.lateTime}`;
    } else if (e.type === 'present') {
      displayTitle = 'Présent(e)';
    } else if (e.type === 'absent') {
      displayTitle = 'Absent(e)';
    }

    return {
      id: e.id,
      title: displayTitle,
      start: e.date,
      className: css,
    };
  }

  refreshCalendar() {
    //lors des refresh du calendar apres ajout evenements l'evenement doit prendre tout la case avec les donne visible (ex : present et heure)
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events
        .filter(e =>
          e.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
        .map(e => this.toFCEvent(e)),
    };
  }



  /* ============================================================
     🎯 CRÉATION
     ============================================================ */
  openCreateDialog() {
    // Ouvre le modal avec la date d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    this.openStatusModal(today);
  }

  /* ============================================================
     🎯 GESTION DU MODAL DE STATUT
     ============================================================ */
  onDateClick(info: any) {
    this.openStatusModal(info.dateStr);
  }

  openStatusModal(dateStr: string | null) {
    this.isFilterMode = dateStr === null;
    this.statusModal = {
      isOpen: true,
      selectedDate: dateStr,
      selectedStatus: null,
      reason: '',
      lateTime: '09:00',
    };
  }

  closeStatusModal() {
    this.statusModal.isOpen = false;
  }

  selectStatus(status: 'present' | 'absent' | 'late') {
    this.statusModal.selectedStatus = status;
  }

  confirmStatus() {
    if (!this.statusModal.selectedStatus) {
      return;
    }

    // Mode filtre: on ne crée pas d'événement, on ferme juste le modal
    if (this.isFilterMode) {
      this.closeStatusModal();
      return;
    }

    // Mode création d'événement
    if (!this.statusModal.selectedDate) {
      return;
    }

    const status = this.statusModal.selectedStatus;
    let title = '';

    switch (status) {
      case 'present':
        title = 'Présent(e)';
        break;
      case 'absent':
        title = this.statusModal.reason
          ? `Absent(e) - "${this.statusModal.reason}"`
          : 'Absent(e)';
        break;
      case 'late':
        title = this.statusModal.reason
          ? `En retard - "${this.statusModal.reason}"`
          : 'En retard';
        break;
    }

    // Vérifier si un événement existe déjà pour cette date
    const existingEventIndex = this.events.findIndex(
      e => e.date === this.statusModal.selectedDate
    );

    const newEvent: CalendarEvent = {
      id: existingEventIndex >= 0
        ? this.events[existingEventIndex].id
        : crypto.randomUUID(),
      title,
      date: this.statusModal.selectedDate!,
      type: status,
      reason: this.statusModal.reason || undefined,
      lateTime: status === 'late' ? this.statusModal.lateTime : undefined,
    };

    if (existingEventIndex >= 0) {
      this.events[existingEventIndex] = newEvent;
    } else {
      this.events.push(newEvent);
    }

    this.refreshCalendar();
    this.closeStatusModal();
  }



  /* ============================================================
     🎯 SUPPRESSION
     ============================================================ */
  onEventClick(info: any) {
    //cet evenement serra inclus dans le formulaire sur un bouton pour delete l'evenement
    const eventId = info.event.id;
    if (confirm('Supprimer cet événement ?')) {
      this.events = this.events.filter(e => e.id !== eventId);
      this.refreshCalendar();
    }
  }



  /* ============================================================
     🎯 MODIFICATION (double clic)
     ============================================================ */
  onEventDoubleClick(event: any) {
    const newTitle = prompt('Modifier le titre :', event.title);
    if (!newTitle) return;

    const e = this.events.find(ev => ev.id === event.id);
    if (e) {
      e.title = newTitle;
      this.refreshCalendar();
    }
  }



  /* ============================================================
     🎯 RECHERCHE
     ============================================================ */
  onSearchChanged(query: string) {
    this.searchQuery = query;
    this.refreshCalendar();
  }
}
