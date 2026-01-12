import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import { map, Subject, takeUntil, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { Profile } from '../interfaces/profile';
import { Ressource } from '../interfaces/ressource';
import { Events } from '../interfaces/events';

@Component({
  selector: 'app-planning',
  imports: [FullCalendarModule],
  templateUrl: './planning.html',
  styleUrl: './planning.css',
})
export class Planning implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);

  ressources: Ressource[] = [];
  events: Events[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [resourceTimelinePlugin],
    initialView: 'resourceTimelineWeek',
    resourceAreaHeaderContent: 'Profils',
    locale: 'fr',
    hiddenDays: [0, 6], // 0 = dimanche, 6 = samedi
    slotLabelContent: (arg) => {
      const date = arg.date;

      return {
        html: `
      <div class="slot-label">
        <div class="slot-date">${date.getDate()}</div>
        <div class="slot-day">
          ${date.toLocaleDateString('fr-FR', { weekday: 'long' })}
        </div>
      </div>
    `,
      };
    },
    eventContent: (arg) => {
      return { html: arg.event.title };
    },
    slotDuration: { days: 1 },
    resources: [],
    events: [],
  };

  ngOnInit(): void {
    this.route.data
      .pipe(
        map((data) => data['profiles'] as Profile[]),
        tap((profiles) => console.log(profiles)),
        takeUntil(this.destroy$)
      )
      .subscribe((profiles) => {
        this.ressources = profiles.map((profile) => profile.ressource);
        this.events = profiles.map((profile) => profile.events);
        this.calendarOptions = {
          ...this.calendarOptions,
          resources: this.ressources,
          events: this.events,
        };
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
