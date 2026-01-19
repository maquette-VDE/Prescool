import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PlanningService } from '../../services/planning/planning-service';
import { DayPilot } from '@daypilot/daypilot-lite-angular';

export type PlanningData = { 
  events: DayPilot.EventData[], 
  resources: DayPilot.ResourceData[] 
};

export const planningResolver: ResolveFn<PlanningData> = (route, state) => {
  const planningService = inject(PlanningService);
  const planningData = planningService.getUsersDayPilotData();
  return planningData;
};