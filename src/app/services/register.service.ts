import { FetchBackend, HttpClient } from "@angular/common/http";
import { ApiConfigService } from "./api-config.service";
import { Injectable } from "@angular/core";
import { Expert } from "../models/expert";
import { Consultant } from "../models/consultant";
import { Store } from "@ngrx/store";
import { FormGroup } from "@angular/forms";
import { selectStep1User } from "../store/register.selectors";
import { UserRole } from "../models/userRole";

@Injectable({
  providedIn: 'root'
})

export class RegisterService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  initialize(user: Consultant | Expert, store : Store, role : UserRole, form : FormGroup): Consultant | Expert {
    
    store.select(selectStep1User).subscribe( userData => {
      user.nom = userData.nom ;
      user.prenom = userData.prenom ;
      user.email = userData.email ;
      user.password = userData.password;
      user.phone = userData.phone || '';
      user.role = role;
    });

    if (role === UserRole.CONSULTANT) {
      const consultant = user as Consultant;
      consultant.code = form.value.code || '';
      consultant.dateArrivee = form.value.dateArrivee || new Date();
      consultant.euMission = form.value.euMission || false;
      return consultant;
    } 
    else {
      const expert = user as Expert;
      expert.diplome = form.value.diplome || '';
      return expert;
    }
  }


  inscription(user: any) {
    const body = {
      "first_name": user.nom,
      "last_name": user.prenom,
      "email": user.email,
      "phone_number": user.phone || '',
      "code": user.code || `expert-${Date.now()}`,
      "password": user.password,
    }; 
    return this.http.post<any>(this.apiConfig.buildUrl('auth/register'),
      body
    );
  }

}