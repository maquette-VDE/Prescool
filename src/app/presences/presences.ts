import { Component, ViewEncapsulation } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'present' | 'absent' | 'late' | 'generic';
  lateTime?: string; // Heure d'arrivée si en retard
  reason?: string;   // Raison (maladie, etc.)
  startTime?: string; // Heure de début (ex: 09:00)
  endTime?: string;   // Heure de fin (ex: 17:00)
  depart?: boolean; //depart anticpe
  heureDepart?: string; // heure de depart
}

interface StatusModalState {
  isOpen: boolean;
  selectedDate: string | null;
  selectedStatus: 'present' | 'absent' | 'late' | null;
  reason: string;
  lateTime: string;
  depart : boolean;
  heureDepart : string
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
    { id: crypto.randomUUID(), title: 'Présent(e)', date: '2025-11-18', type: 'present', startTime: '09:00', endTime: '18:00' },
    { id: crypto.randomUUID(), title: 'Présent(e)', date: '2025-11-19', type: 'present', startTime: '09:30', endTime: '17:00' },
    { id: crypto.randomUUID(), title: 'Présent(e)', date: '2025-11-20', type: 'present', startTime: '09:00', endTime: '18:00' },
    { id: crypto.randomUUID(), title: 'Présent(e)', date: '2025-11-21', type: 'present', startTime: '09:30' },
    { id: crypto.randomUUID(), title: 'En retard - "on doit aller chercher mes enfants"', date: '2025-11-26', type: 'late', reason: 'on doit aller chercher mes enfants', lateTime: '17:30' }
  ];

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  currentView: 'dayGridMonth' | 'timeGridWeek' = 'dayGridMonth';

  searchQuery = '';
  statusModal: StatusModalState = {
    isOpen: false,
    selectedDate: null,
    selectedStatus: null,
    reason: '',
    lateTime: '09:00',
    depart : false,
    heureDepart : '15:00'
  };
  isFilterMode = false;

  // Modal de suppression
  deleteModal = {
    isOpen: false,
    eventId: '' as string,
    eventTitle: '' as string,
  };

  // Propriété pour la semaine actuelle
  currentWeek = {
    dayOfMonth: 0,
    monthName: '',
    monthAbbr: '',
    yearName: 0,
    startDate: '',
    endDate: '',
  };



  /* ============================================================
     🎯 OPTIONS DU CALENDRIER
     ============================================================ */
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'fr',
    locales: [frLocale],
    firstDay: 1,

    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5], // lundi → vendredi
      startTime: '08:00',
      endTime: '18:00',
    },

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
     
      const reason = info.event.extendedProps['reason'];
      const lateTime = info.event.extendedProps['lateTime'];
      const pou = info.event.start;
      if (lateTime || reason) {
        let tooltipText = ''

        if (lateTime) {
          tooltipText += ` ${lateTime}`; 
        }
        if (reason) {
          tooltipText += ` : ${reason}`; 
        }
        if (pou) {
          tooltipText += '\n'; 
          tooltipText += pou.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          });
      }

        if (tooltipText) {
          info.el.setAttribute('title', tooltipText);
        }
      }
    },

    // Événement quand les dates affichées changent
    datesSet: (info) => {
      this.currentView = info.view.type as 'dayGridMonth' | 'timeGridWeek';
      this.onDatesChanged(info.start);
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
    this.updateCurrentWeek();
    this.refreshCalendar();
  }

  /* ============================================================
     🎯 CALCUL DE LA SEMAINE ACTUELLE
     ============================================================ */
  updateCurrentWeek(date?: Date) {
    const targetDate = date || new Date();
    const dayOfWeek = targetDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
    
    // Calculer le lundi de la semaine en cours
    const mondayDate = new Date(targetDate);
    const diff = targetDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajuster si dimanche
    mondayDate.setDate(diff);
    
    // Calculer le vendredi de la semaine en cours
    const fridayDate = new Date(mondayDate);
    fridayDate.setDate(mondayDate.getDate() + 4);

    // Options pour le formatage de la date
    const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const monthAbbrv = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUI',
                        'JUI', 'AOU', 'SEP', 'OCT', 'NOV', 'DÉC'];
    
    const dayOfMonth = targetDate.getDate();
    const monthName = monthNames[targetDate.getMonth()];
    const monthAbbr = monthAbbrv[targetDate.getMonth()];
    const yearName = targetDate.getFullYear();
    
    // Format des dates: "17 nov 2025 – 19 déc 2025"
    const startDateStr = `${mondayDate.getDate()} ${monthNames[mondayDate.getMonth()].substring(0, 3)} ${mondayDate.getFullYear()}`;
    const endDateStr = `${fridayDate.getDate()} ${monthNames[fridayDate.getMonth()].substring(0, 3)} ${fridayDate.getFullYear()}`;
    
    this.currentWeek = {
      dayOfMonth,
      monthName,
      monthAbbr,
      yearName,
      startDate: startDateStr,
      endDate: endDateStr,
    };
  }

  onDatesChanged(date: Date) {
    // Met à jour la semaine quand les dates du calendrier changent
    this.updateCurrentWeek(date);
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
    let displayTitle = '';
    
    if (e.type === 'present') {
      displayTitle = 'Présent(e)';
      if (e.startTime && e.endTime) {
        displayTitle += ` ${e.startTime} - ${e.endTime}`;
      } else if (e.startTime) {
        displayTitle += ` ${e.startTime}`;
      }
      if (e.depart && e.heureDepart) {
        displayTitle += ` : Départ anticipé ${e.heureDepart}`;
      } else if (e.depart) {
        displayTitle += ` : Départ anticipé`;
        }
    } else if (e.type === 'absent') {
      displayTitle = 'Absent(e)';
      if (e.startTime) {
          displayTitle += ` ${e.startTime}`;
        }
        if (e.reason) {
          displayTitle += ` : ${e.reason}`;
        }
    } else if (e.type === 'late') {
      displayTitle = 'Retard';
       if (e.lateTime) {
          displayTitle += ` ${e.lateTime}`;
        }
        if (e.reason) {
          displayTitle += ` : ${e.reason}`;
        }
      }

    return {
      id: e.id,
      title: displayTitle,
      start: e.date,
      className: css,
      extendedProps: {
        reason : e.reason,
        lateTime : e.lateTime,
        depart: e.depart,
        heureDepart: e.heureDepart

      }
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
      depart : false,
      heureDepart : '15:00',
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
      depart: this.statusModal.depart,
      heureDepart: this.statusModal.heureDepart,
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
    // Ouvrir la modal de suppression au lieu d'utiliser confirm()
    const event = this.events.find(e => e.id === info.event.id);
    if (event) {
      this.openDeleteModal(info.event.id, event.title);
    }
  }

  openDeleteModal(eventId: string, eventTitle: string) {
    this.deleteModal = {
      isOpen: true,
      eventId,
      eventTitle,
    };
  }

  closeDeleteModal() {
    this.deleteModal.isOpen = false;
  }

  confirmDelete() {
    this.events = this.events.filter(e => e.id !== this.deleteModal.eventId);
    this.refreshCalendar();
    this.closeDeleteModal();
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
  /*============================================================
    🎯 Switch de vue 
    ============================================================ */
  switchToMonth() {
    this.calendarComponent.getApi().changeView('dayGridMonth');
  }
  switchToWeek() {
    this.calendarComponent.getApi().changeView('timeGridWeek'); 
  }
}
