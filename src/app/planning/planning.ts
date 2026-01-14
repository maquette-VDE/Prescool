import { Component, ViewChild, AfterViewInit, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { DayPilot, DayPilotModule, DayPilotSchedulerComponent } from '@daypilot/daypilot-lite-angular';
import { Profile } from '../interfaces/profile';
import { ActivatedRoute } from '@angular/router';
import { map, takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [DayPilotModule],
  template: `<daypilot-scheduler [config]="config()" #scheduler></daypilot-scheduler>`,
  styles: [`

  ::ng-deep  .rounded_corner_inner::before {
    content: "Consultants"; 
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    font-weight: bold;
    color: #333;
    z-index: 10;
}

::ng-deep .rounded_corner_inner {

    border: 1px solid #e0e0e0;
}
::ng-deep .rounded_divider_horizontal {
    border-top: 0px solid #e0e0e0 !important;
}
::ng-deep .rounded_cell {
    background-color: #ffffff !important;
    border-right: 1px solid #ececec !important; 
    border-bottom: 1px solid #ececec !important;
}

::ng-deep .rounded_rowheader {
    background-color: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
}

::ng-deep .rounded_rowheader_inner {
    display: flex;
    align-items: center;
    padding-left: 10px !important;
    font-weight: 500;
}

::ng-deep .rounded_timeheader_cell {
    background-color: #fcfcfc !important;
    border-right: 1px solid #ececec !important;
    border-bottom: 1px solid #ececec !important;
    color: #666;
}
::ng-deep .rounded_event_inner {
    border: none !important;
    border-radius: inherit !important; /* Utilise le rounded-3 de Bootstrap */
    padding: 0 !important;
    height: 100% !important;
}
  `]
})
export class Planning implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  @ViewChild('scheduler') scheduler!: DayPilotSchedulerComponent;

  eventTypes = [
    { name: "Présent", id: "presence", color: "#93c47d" },
    { name: "Absent", id: "absence", color: "#6fa8dc" },
    { name: "En retard", id: "retard", color: "#f6b26b" }
  ];

  contextMenu = new DayPilot.Menu({
    items: [
      { text: "Modifier", onClick: args => this.editEvent(args.source) },
      { text: "-" },
      { text: "Supprimer", onClick: args => this.scheduler.control.events.remove(args.source) }
    ]
  });

  config = signal<DayPilot.SchedulerConfig>({
    timeHeaders: [
      { groupBy: "Day", format: "dddd d" }
    ],
    scale: "Day",
    startDate: DayPilot.Date.today(),
    days: 365,
    heightSpec: "Max",
    height: 400,
    rowMarginTop: 2,
    rowMarginBottom: 2,
    rowHeaderWidth: 180,
    eventHeight: 100,
    theme: "rounded",
    cellWidth: 200,
   
    onTimeRangeSelected: async (args) => {
      const data = {
        start: args.start,
        end: args.end,
        resource: args.resource,
        id: DayPilot.guid(),
        text: "Nouvelle présence",
        tags: { type: "presence" }
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
      const type = this.eventTypes.find(t => t.id === args.data.tags?.type) ?? this.eventTypes[0];
      
      args.data.backColor = type.color;
      args.data.fontColor = "#ffffff";
      args.data.cssClass = "rounded-2 shadow-sm border-0";
      const durationText = args.data.start.toString().slice(11,16) + " - " + args.data.end.toString().slice(11,16);

      args.data.html = `
        <div class="d-flex align-items-center pt-1 px-2 fw-semibold" style="font-size: 0.65rem;">
          <span class="ms-auto">${args.data.start.toString().split("T")[1] + " - " + args.data.end.toString().split("T")[1]}</span>
        </div>
      `;

      // Zones interactives (Icone Menu à droite)
      // args.data.areas = [
      //   {
      //     right: 5,
      //     top: 15,
      //     width: 20,
      //     height: 20,
      //     style: "cursor:pointer;",
      //     backColor: "rgba(255,255,255,0.3)",
      //     borderRadius: "50%",
      //     text: "⋮",
      //     fontColor: "#ffffff",
      //     horizontalAlignment: "center",
      //     action: "ContextMenu",
      //     menu: this.contextMenu
      //   }
      // ];
    },

    onBeforeRowHeaderRender: (args) => {
    const profile = args.row.data; 
  
    args.row.html = `
      <div class="d-flex align-items-center p-2">
        <div class="rounded-circle bg-light me-3" style="width: 35px; height: 35px; border: 0px solid #F1F1F1;"></div>
        <div class="d-flex flex-column" style="margin-right: 10px;">
          <span class="fw-bold text-dark" style="font-size: 0.9rem;">${args.row.name}</span>
          <span class="text-muted" style="font-size: 0.7rem;">${args.row.id}</span>
        </div>
        <i class="bi bi-phone text-success ms-auto" style="font-size: 1.2rem;"></i>
      </div>
    `;
  }
  });


  async editEvent(e: DayPilot.Event) {
    const result = await this.openModal(e.data);
    if (result) {
      this.scheduler.control.events.update(result);
    }
  }

  async openModal(data: any) {
    const form = [
      { name: "Titre", id: "text", type: "text" },
      { name: "Type", id: "tags.type", type: "select", options: this.eventTypes.map(t => ({ name: t.name, id: t.id })) },
      { name: "Début", id: "start", type: "datetime" },
      { name: "Fin", id: "end", type: "datetime" }
    ];

    const modal = await DayPilot.Modal.form(form, data);
    return modal.canceled ? null : modal.result;
  }


  ngOnInit(): void {
    this.route.data
      .pipe(
        map(data => data['profiles'] as Profile[]),
        takeUntil(this.destroy$)
      )
      .subscribe(profiles => {
        if (profiles) this.updateScheduler(profiles);
      });
  }

  ngAfterViewInit(): void {
    const initialProfiles = this.route.snapshot.data['profiles'];
    if (initialProfiles) this.updateScheduler(initialProfiles);
  }

  private updateScheduler(profiles: Profile[]): void {
    const resources = profiles.map(p => ({
      id: p.ressource.id,
      name: p.ressource.title
    }));

    const events = profiles.map(p => ({
      id: DayPilot.guid(),
      resource: p.events.resource,
      start: p.events.start.length === 16 ? p.events.start  : p.events.start,
      end: p.events.end.length === 16 ? p.events.end  : p.events.end,
      text: p.events.type.charAt(0).toUpperCase()+p.events.type.slice(1) ,
      tags: { type: p.events?.type ?? "presence" }
    }));

    this.scheduler.control.update({ resources, events });

    if (events.length > 0) {
      this.scheduler.control.scrollTo(events[0].start);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}