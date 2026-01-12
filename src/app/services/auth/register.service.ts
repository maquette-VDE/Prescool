import { FetchBackend, HttpClient } from "@angular/common/http";
import { ApiConfigService } from "../api-config.service";
import { Injectable } from "@angular/core";
import { Expert } from "../../models/expert";
import { Consultant } from "../../models/consultant";
import { Store } from "@ngrx/store";
import { FormGroup } from "@angular/forms";
import { selectStep1User } from "../../store/register.selectors";
import { UserRole } from "../../models/userRole";

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
      user.last_name = userData.last_name ;
      user.first_name = userData.first_name ;
      user.email = userData.email ;
      user.password = userData.password;
      user.phone = userData.phone || '';
      user.role = role;
    });

    if (role === UserRole.CONSULTANT) {
      const consultant = user as Consultant;
      consultant.code = form.value.code || '';
      consultant.arrivedAt = form.value.arrivedAt || new Date();
      consultant.gotMission = form.value.gotMission || false;
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
      "first_name": user.first_name,
      "last_name": user.last_name,
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