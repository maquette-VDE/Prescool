import { ResolveFn } from '@angular/router';

import { Profile } from '../../interfaces/profile';
import { inject } from '@angular/core';
import { PlanningService } from '../../services/planning/planning-service';

export const planningResolver: ResolveFn<Profile[]> = (route, state) => {
  const planningService = inject(PlanningService);
  const profiles = planningService.getProfiles();
  return profiles;
};
