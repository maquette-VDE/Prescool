import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PlanningService } from '../../services/planning/planning-service';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { Speciality } from '../../interfaces/speciality';
export type PlanningData = {
  events: DayPilot.EventData[],
  resources: DayPilot.ResourceData[],
  pagination: { total: number, pages: number },
  specialties: Speciality[]
};

export const planningResolver: ResolveFn<PlanningData> = (route, state) => {
  const planningService = inject(PlanningService);
  const startFrom = DayPilot.Date.today().firstDayOfWeek(1).toString();
  const startTo = new DayPilot.Date(startFrom).addDays(5).toString();
  const planningData$ = planningService.getUsersDayPilotData(0, 10, startFrom, startTo, '', '', '');
  return planningData$ ;
};
