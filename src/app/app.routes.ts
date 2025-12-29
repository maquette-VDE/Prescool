import { Routes } from '@angular/router';
import { Acceuil } from './acceuil/acceuil';
import { Login } from './login/login';
import { CreateExpert } from './create-expert/create-expert';
import { ConfirmeExpert } from './confirme-expert/confirme-expert';
import { CreateConsultant } from './create-consultant/create-consultant';
import { ConfirmeConsultant } from './confirme-consultant/confirme-consultant';
import { Presences } from './presences/presences';
import { SideNav } from './side-nav/side-nav';
import { Planning } from './planning/planning';
import { planningResolver } from './resolvers/planning/planning-resolver';

export const routes: Routes = [
  { path: '', component: Acceuil },
  { path: 'login', component: Login },

  {
    path: '', // AppShell parent
    component: SideNav,
    children: [
      { path: 'create-expert', component: CreateExpert },
      { path: 'confirme-expert', component: ConfirmeExpert },
      { path: 'create-consultant', component: CreateConsultant },
      { path: 'confirme-consultant', component: ConfirmeConsultant },
      { path: 'presences', component: Presences },
      // { path: 'presences', component: Planning, resolve: { profiles: planningResolver } }
    ],
  },
];
