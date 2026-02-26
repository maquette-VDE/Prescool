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
import { Dashboard } from './dashboard/dashboard';
import { Aide } from './aide/aide';
import { Statistics } from './statistics/statistics';
import { Settings } from './settings/settings';
import { Annonces } from './annonces/annonces';
import { planningResolver } from './resolvers/planning/planning-resolver';
import { roleGuard } from './guards/role-guard';
import { WaitConfirmation } from './wait-confirmation/wait-confirmation';
import { consultantResolver } from './resolvers/consultant/consultant-resolver';
import { evenementsResolver } from './resolvers/evenements/evenements-resolver';
import { Erreur } from './erreur/erreur';
import { Equipes } from './equipes/equipes';
import { Projets } from './projets/projets';
import { Instructor } from './instructor/instructor';
import { instructorGuard } from './guards/instructor-guard';
import { instructorsResolver } from './resolvers/instructors/instructors-resolver';

export const routes: Routes = [
  { path: '', component: Acceuil },
  { path: 'login', component: Login },
  { path: 'create-user', component: CreateUser },
  { path: 'confirm-expert', component: ConfirmeExpert },
  { path: 'confirm-consultant', component: ConfirmeConsultant },
  { path: 'settings', component: Settings },
  { path: 'wait-confirmation', component: WaitConfirmation },
  { path: 'error', component: Erreur },
  {
    path: 'sidenav',
    component: SideNav,
    children: [
      {
        path: 'presences',
        component: Presences,
        data: {
          title: 'La liste de présence',
          subtitle: 'Consultez la présence des consultants',canActivate: [roleGuard]
        }
      },
      { 
        path: 'dashboard', 
        component: Dashboard,
        data: { title: 'Tableau de bord', subtitle: 'Aperçu global de votre activité' } 
      },
      { 
        path: 'annonces', 
        component: Annonces,
        data: { title: 'Tableau d’annonces', subtitle: 'Gérez les dernières actualités' } 
      },
      { 
        path: 'statistics', 
        component: Statistics,
        data: { title: 'Statistiques', subtitle: 'Analyse des données' } 
      },
      { 
        path: 'planning', 
        component: Planning, 
        resolve: { planningData: planningResolver },
        data: { title: 'Planning', subtitle: 'Gestion de l’emploi du temps' }
      },
      { 
        path: 'consultant', 
        component: Consultant,
        data: { title: 'Consultants', subtitle: 'Liste des membres' ,},canActivate: [instructorGuard],
        resolve: {
          consultants: consultantResolver,
          evenements: evenementsResolver,
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
      },
      { 
        path: 'settings', // Corrigé "Settings" en minuscule pour être uniforme
        component: Settings,
        data: { title: 'Paramètres', subtitle: 'Configuration de votre compte' }
      },
      { 
        path: 'aide', 
        component: Aide,
        data: { title: 'Aide', subtitle: 'Centre d’assistance' } 
      },
      { path: 'confirm-consultant', component: ConfirmeConsultant },
      {
        path: 'instructor',
        component: Instructor,
        resolve: {
          instructors: instructorsResolver,
          evenements: evenementsResolver,
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
      },
      {path : 'projets', component : Projets},
      {path : 'equipes', component : Equipes},
    ],
  },
  // Route "catch-all" en cas d'URL inconnue
  { path: '**', redirectTo: 'error' }
];
