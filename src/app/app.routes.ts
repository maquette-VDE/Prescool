import { Routes } from '@angular/router';
import { Acceuil } from './acceuil/acceuil';
import { Login } from './login/login';
import { ConfirmeExpert } from './confirme-expert/confirme-expert';
import { CreateUser } from './create-user/create-user';
import { ConfirmeConsultant } from './confirme-consultant/confirme-consultant';
import { Presences } from './presences/presences';
import { WaitConfirmation } from './wait-confirmation/wait-confirmation';
import { ValidateUsers } from './validate-users/validate-users';

export const routes: Routes = [
    {path : '', component : Acceuil},
    {path : 'login', component : Login},
    {path : 'create-user', component : CreateUser},
    {path : 'confirm-expert', component : ConfirmeExpert},
    {path : 'confirm-consultant', component : ConfirmeConsultant},
    {path : 'wait-confirmation', component : WaitConfirmation},
    {path : 'presences', component : Presences},
    {path : 'validate-users', component: ValidateUsers}
];
