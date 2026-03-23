import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PlanningService } from '../../services/planning/planning-service';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { Speciality } from '../../interfaces/speciality';
 
export type PlanningData = {
  events: DayPilot.EventData[];
  resources: DayPilot.ResourceData[];
  pagination: { total: number; pages: number };
  specialties: Speciality[];
  // Ajout pour RouterPagination
  page: number;
  limit: number;
  pages: number;
};
 
export const planningResolver: ResolveFn<PlanningData> = (route) => {
  const planningService = inject(PlanningService);
 
  // Lecture des queryParams — avec valeurs par défaut
  const page   = +(route.queryParams['page']  ?? 0);
  const limit  = +(route.queryParams['limit'] ?? 10);
  const status    = route.queryParams['status']    ?? '';
  const specialty = route.queryParams['specialty'] ?? '';
 
  // Semaine courante par défaut, ou depuis queryParams si présents
  const startFrom = route.queryParams['startFrom']
    ?? DayPilot.Date.today().firstDayOfWeek(1).toString();
  const startTo = route.queryParams['startTo']
    ?? new DayPilot.Date(startFrom).addDays(5).toString();
 
  return planningService.getUsersDayPilotData(
    page, limit, startFrom, startTo, '', status, specialty
  );
};