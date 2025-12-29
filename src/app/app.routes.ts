import { Routes } from '@angular/router';
import { Acceuil } from './acceuil/acceuil';
import { Login } from './login/login';
import { CreateExpert } from './create-expert/create-expert';
import { ConfirmeExpert } from './confirme-expert/confirme-expert';
import { CreateConsultant } from './create-consultant/create-consultant';
import { ConfirmeConsultant } from './confirme-consultant/confirme-consultant';
import { Presences } from './presences/presences';

export const routes: Routes = [
    {path : '', component : Acceuil},
    {path : 'login', component : Login},
    {path : 'create-expert', component : CreateExpert},
    {path : 'create-consultant', component : CreateConsultant},
    {path : 'confirme-expert', component : ConfirmeExpert},
    {path : 'confirme-consultant', component : ConfirmeConsultant},
    {path : 'presences', component : Presences}
];
