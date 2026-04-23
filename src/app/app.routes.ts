import { Routes } from '@angular/router';
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
import { AnnonceComponent } from './annonces/annonces';
import { WaitConfirmation } from './wait-confirmation/wait-confirmation';
import { consultantResolver } from './resolvers/consultant/consultant-resolver';
import { Erreur } from './erreur/erreur';
import { Equipes } from './equipes/equipes';
import { Instructor } from './instructor/instructor';
import { AnnoncesPanelComponent } from './annonces-panel/annonces-panel';

// Resolvers
import { planningResolver } from './resolvers/planning/planning-resolver';
import { instructorsResolver } from './resolvers/instructors/instructors-resolver';
import { dashboardResolver } from './resolvers/dashboard/dashboard-resolver';
import { dashboardEvenementsResolver } from './resolvers/evenements/evenements-resolver';
import { dashboardWeeklyResolver } from './resolvers/dashboard/dashboard-weekly-resolver';

// Guards
import { roleGuard } from './guards/role-guard';
import { instructorGuard } from './guards/instructor-guard';

export const routes: Routes = [
  // --- ROUTES PUBLIQUES / AUTH ---
  { path: '', component: Login },
  { path: 'create-user', component: CreateUser },
  { path: 'confirm-expert', component: ConfirmeExpert },
  { path: 'confirm-consultant', component: ConfirmeConsultant },
  { path: 'wait-confirmation', component: WaitConfirmation },
  { path: 'error', component: Erreur },

  // --- INTERFACE PRINCIPALE (SIDENAV) ---
  {
    path: 'sidenav',
    component: SideNav,
    children: [
      {
        path: 'presences',
        component: Presences,
        canActivate: [roleGuard],
        data: {
          title: 'La liste de présence',
          subtitle: 'Consultez la présence des consultants',
        },
      },
      {
        path: 'dashboard',
        component: Dashboard,
        resolve: {
          dashboardStats: dashboardResolver,
          evenements: dashboardEvenementsResolver,
          weeklyStats: dashboardWeeklyResolver,
        },
        runGuardsAndResolvers: 'always',
        data: {
          title: 'Tableau de bord',
          subtitle: 'Aperçu global de votre activité',
        },
      },
      { 
        path: 'annonces', 
        component: AnnoncesPanelComponent, 
        data: { 
          title: "Annonces", 
          subtitle: 'Consultez les dernières actualités' 
        } 
      },
     {
      path: 'annonces/:id',
      component: AnnonceComponent,
      data: { 
      title: 'Détail de l\'annonce',
      subtitle: 'Consultez les dernières actualités' 
      }
    },
      {
        path: 'presences',
        component: Presences,
        canActivate: [roleGuard],
        data: {
          title: 'La liste de présence',
          subtitle: 'Consultez la présence des consultants',
        },
      },
      {
        path: 'planning',
        component: Planning,
        resolve: { planningData: planningResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: { 
          title: 'Planning', 
          subtitle: "Gestion de l'emploi du temps" 
        }
      },
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
          evenements: dashboardEvenementsResolver,
          weeklyStats: dashboardWeeklyResolver,
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
      },
        {
          path: 'consultant',
          component: Consultant,
        data: {
          title: 'Consultants', 
          subtitle: 'Liste des membres' 
        }
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
          evenements: dashboardEvenementsResolver,
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: { 
          title: 'Instructeurs', 
          subtitle: 'Gestion des instructeurs' 
        },
      },
      {
        path: 'equipes',
        component: Equipes,
        data: { 
          title: 'Équipes', 
          subtitle: 'Gestion des groupes' 
        },
      },
      {
        path: 'aide',
        component: Aide,
        data: { 
          title: 'Aide', 
          subtitle: "Centre d'assistance" 
        },
      },
      // Redirection par défaut à l'intérieur de la sidenav
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // --- REDIRECTION PAR DÉFAUT ---
  { path: '**', redirectTo: 'error' },
];
