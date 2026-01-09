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