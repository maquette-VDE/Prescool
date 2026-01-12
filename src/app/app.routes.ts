import { Routes } from '@angular/router';
import { Acceuil } from './acceuil/acceuil';
import { Login } from './login/login';
import { ConfirmeExpert } from './confirme-expert/confirme-expert';
import { CreateUser } from './create-user/create-user';
import { ConfirmeConsultant } from './confirme-consultant/confirme-consultant';
import { Presences } from './presences/presences';
import { WaitConfirmation } from './wait-confirmation/wait-confirmation';
import { ValiderUser } from './validate-user/validate-user';

export const routes: Routes = [
    {path : '', component : Acceuil},
    {path : 'login', component : Login},
    {path : 'create-user', component : CreateUser},
    {path : 'confirme-expert', component : ConfirmeExpert},
    {path : 'confirme-consultant', component : ConfirmeConsultant},
    {path : 'attente-confirmation', component : WaitConfirmation},
    {path : 'presences', component : Presences},
    {path : 'valider-user', component : ValiderUser}
];
