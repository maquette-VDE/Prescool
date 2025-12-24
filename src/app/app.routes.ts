import { Routes } from '@angular/router';
import { Presences } from './presences/presences';
import { Consultants } from './consultants/consultants';
import { planningResolver } from './resolvers/planning/planning-resolver';
import { Planning } from './planning/planning';

export const routes: Routes = [
    {
      path: 'presences',
      component: Planning,
      resolve: {profiles: planningResolver}
    },
    { path: 'consultants', component: Consultants },
];
