import { Consultant } from './../models/consultant';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiConfigService } from "./api-config.service";
import { tap } from "rxjs";
import { HttpHeaders, HttpParams } from "@angular/common/http";
import { Expert } from "../models/expert";

@Injectable({
  providedIn: 'root'//enregistre à la racine de l'application
})

export class AuthService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}
  
  inscription(user: Consultant | Expert) {

    const body = new HttpParams()
    .set('first_name', user.nom)   
    .set('last_name', user.prenom)
    .set('email', user.email)
    .set('code', (user as Consultant).code || '')
    .set('phone_number', user.phone || '')
    .set('password', user.password);

  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  });
    return this.http.post<any>(this.apiConfig.buildUrl('auth/register'),
      body.toString(),{ headers }
    ).pipe(
      tap(response => {
        console.log('inscrit:', response);
        localStorage.setItem('username', response.email);
      })
    );
  }    

}