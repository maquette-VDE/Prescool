import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { EvenementsService } from '../../services/evenements/evenements-service';
import { UserEvent } from '../../interfaces/events';

export const dashboardEvenementsResolver: ResolveFn<UserEvent[]> = () => {
  const evenementsService = inject(EvenementsService);
  return evenementsService.getEvenementsActifsToday();
};