import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PlanningService } from '../../services/planning/planning-service';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { Observable } from 'rxjs';

export type PlanningData = {
  events: DayPilot.EventData[],
  resources: DayPilot.ResourceData[]
};

export const planningResolver: ResolveFn<PlanningData> = (route, state) => {
  const planningService = inject(PlanningService);
  const startFrom = DayPilot.Date.today().firstDayOfWeek(1).toString();
  const startTo = new DayPilot.Date(startFrom).addDays(5).toString();
  return planningService.getUsersDayPilotData(0,4, startFrom, startTo);
};
