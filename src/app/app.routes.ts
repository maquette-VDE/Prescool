import { Routes } from '@angular/router';
import { Acceuil } from './acceuil/acceuil';
import { Login } from './login/login';
import { ConfirmeExpert } from './confirme-expert/confirme-expert';
import { CreateUser } from './create-user/create-user';
import { ConfirmeConsultant } from './confirme-consultant/confirme-consultant';
import { Presences } from './presences/presences';
import { SideNav } from './side-nav/side-nav';
import { Planning } from './planning/planning';
import { Consultant } from './consultant/consultant';
import {Dashboard} from  './dashboard/dashboard';
import {Aide} from  './aide/aide';
import {Statistics} from  './statistics/statistics';
import {Settings} from  './settings/settings';

import {Annonces} from  './annonces/annonces';
import { planningResolver } from './resolvers/planning/planning-resolver';
import { roleGuard } from './guards/role-guard';
import { WaitConfirmation } from './wait-confirmation/wait-confirmation';
import { consultantResolver } from './resolvers/consultant/consultant-resolver';
import { evenementsResolver } from './resolvers/evenements/evenements-resolver';
import { Erreur } from './erreur/erreur';
import { Equipes } from './equipes/equipes';
import { Projets } from './projets/projets';

export const routes: Routes = [
  { path: '', component: Acceuil },
  { path: 'login', component: Login },
  { path: 'create-user', component: CreateUser },
  { path: 'confirm-expert', component: ConfirmeExpert },
  { path: 'confirm-consultant', component: ConfirmeConsultant },
  {path : 'settings', component : Settings},
  { path: 'wait-confirmation', component: WaitConfirmation },
  {path : 'error', component : Erreur},
  {
    path: 'sidenav',
    component: SideNav,
    children: [
      { path: 'presences', component: Presences, canActivate: [roleGuard] },
      {path : 'statistics', component : Statistics},
      {path : 'settings', component : Settings},
      {path : 'dashboard', component : Dashboard },
      {path : 'annonces', component : Annonces},
      {path : 'aide', component : Aide},
      {path : 'confirm-consultant', component : ConfirmeConsultant},
      {path : 'projets', component : Projets},
      {path : 'equipes', component : Equipes},
      {
        path: 'planning',
        component: Planning,
        resolve: { planningData: planningResolver },
      },
      {
        path: 'consultant',
        component: Consultant,
        resolve: {
          consultants: consultantResolver,
          evenements: evenementsResolver,
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange'
      },
    ],
  },
]
