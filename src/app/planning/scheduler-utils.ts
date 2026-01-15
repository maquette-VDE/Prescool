import { DayPilot } from "@daypilot/daypilot-lite-angular";

export class SchedulerUtils {
  static readonly eventTypes = {
    presence: { color: '#6BB346', textColor: '#3CAA04' },
    absence: { color: '#B31F24', textColor: '#B31F24' },
    retard: { color: '#F78404', textColor: '#F78404' },
  };

  static renderEvent(args: any): void {
    const typeKey = args.data.tags?.type as keyof typeof SchedulerUtils.eventTypes;
    const type = this.eventTypes[typeKey] || this.eventTypes.presence;
    const eventIsPast = new DayPilot.Date(args.data.start) < new DayPilot.Date();

    args.data.backColor = eventIsPast ? `${type.color}35` : `${type.color}65`
    args.data.fontColor = eventIsPast ? `${type.color}75` : type.textColor;
    args.data.cssClass = 'border-1 rounded-3 shadow-none';

    const start = new DayPilot.Date(args.data.start).toString('HH:mm');
    const end = new DayPilot.Date(args.data.end).toString('HH:mm');

  
    args.data.html = `
      <div class="d-flex flex-column align-items-center justify-content-center h-100 text-center" style="${eventIsPast ? 'opacity: 0.35' : ''}">
        <div class="fw-bold">${typeKey === 'absence' ? 'Absent' : `${start} - ${end}`}</div>
        ${args.data.text ? `<div class="fst-italic small opacity-75">"${args.data.text}"</div>` : ''}
      </div>`;
  }

  static renderResource(args: any): void {
    const initials = args.row.name.substring(0, 2).toUpperCase();
    args.row.html = `
      <div class="d-flex align-items-center p-2">
        <div class="rounded-circle d-flex align-items-center justify-content-center me-2 bg-light fw-bold" 
             style="width: 35px; height: 35px; font-size: 0.8rem; color: #666;">${initials}</div>
        <div class="d-flex flex-column">
          <span class="fw-bold small">${args.row.name}</span>
          <span class="text-muted" style="font-size: 0.7rem;">${args.row.id}</span>
        </div>
        <i class="bi bi-phone-vibrate text-success ms-auto"></i>
      </div>`;
  }
}