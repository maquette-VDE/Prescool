import { Routes } from '@angular/router';
import { Acceuil } from './acceuil/acceuil';
import { Login } from './login/login';
import { ConfirmeExpert } from './confirme-expert/confirme-expert';
import { CreateUser } from './create-user/create-user';
import { ConfirmeConsultant } from './confirme-consultant/confirme-consultant';
import { Presences } from './presences/presences';
<<<<<<< HEAD
import { AttenteConfirmation } from './attente-confirmation/attente-confirmation';
import { ValiderUser } from './valider-user/valider-user';

export const routes: Routes = [
    {path : '', component : Acceuil},
    {path : 'login', component : Login},
    {path : 'create-user', component : CreateUser},
    {path : 'confirme-expert', component : ConfirmeExpert},
    {path : 'confirme-consultant', component : ConfirmeConsultant},
    {path : 'attente-confirmation', component : AttenteConfirmation},
    {path : 'presences', component : Presences},
    {path : 'valider-user', component : ValiderUser}
=======
import { SideNav } from './side-nav/side-nav';
import { Planning } from './planning/planning';
import { planningResolver } from './resolvers/planning/planning-resolver';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: '', component: Acceuil },
  { path: 'login', component: Login },
  { path: 'create-expert', component: CreateExpert },
  { path: 'confirme-expert', component: ConfirmeExpert },
  { path: 'create-consultant', component: CreateConsultant },
  { path: 'confirme-consultant', component: ConfirmeConsultant },
  {
    path: 'sidenav',
    component: SideNav,
    children: [
      { path: 'presences', component: Presences, canActivate: [roleGuard] },
      {
        path: 'planning',
        component: Planning,
        resolve: { profiles: planningResolver },
      },
    ],
  },
>>>>>>> 265568335c9a18b24fe15addc6b444cfbeaed9eb
];
