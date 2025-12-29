import { Component, ViewEncapsulation } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'present' | 'absent' | 'late' | 'generic';
}

@Component({
  selector: 'app-presences',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './presences.html',
  styleUrl: './presences.css',
  encapsulation: ViewEncapsulation.None,
})
export class Presences {

  /* ============================================================
     🎯 DONNÉES (non connectées au backend pour l’instant)
     ============================================================ */
  events: CalendarEvent[] = [
    { id: crypto.randomUUID(), title: 'Absent(e) - "maladie"', date: '2025-11-17', type: 'absent' },
    { id: crypto.randomUUID(), title: 'Présent(e)', date: '2025-11-21', type: 'present' },
    { id: crypto.randomUUID(), title: 'Retard - "Rendez-vous France Travail"', date: '2025-11-25', type: 'late' }
  ];

  searchQuery = '';



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

    return {
      id: e.id,
      title: e.title,
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
  addEvent(title: string, date: string, type: CalendarEvent['type']) {
    this.events.push({
      id: crypto.randomUUID(),
      title,
      date,
      type,
    });
    this.refreshCalendar();
  }

  openCreateDialog() {
    //essaye plutot de creer un formulaire pour ajouter les evenements
    const title = prompt('Titre de l’événement :');
    if (!title) return;

    const date = prompt('Date (AAAA-MM-JJ) :');
    if (!date) return;

    const type = prompt('Type (present / absent / late / generic) :', 'present') as any;

    this.addEvent(title, date, type);
  }

  onDateClick(info: any) {
    this.openCreateDialog();
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
