import { Injectable } from "@angular/core";
import { UserRole } from "../models/userRole";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { ApiConfigService } from "./api-config.service";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'//enregistre à la racine de l'application
})

export class RoleService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  convertRole(roleStr: string): UserRole | null {
    switch(roleStr.toLowerCase()) {
      case 'student':
        return UserRole.CONSULTANT;
      case 'encadrant':
        return UserRole.EXPERT;
      case 'admin':
        return UserRole.ADMIN;
      default:
        return null;
    }
  }
  
  toString(role: UserRole): string {
    switch(role) {
      case UserRole.CONSULTANT:
        return 'student';
      case UserRole.EXPERT:
        return 'encadrant';
      case UserRole.ADMIN:
        return 'admin';
      default:
        return '';
    }
  }

  getRole(email :string): Observable<UserRole | null> {
    const parameters = new HttpParams().set('user_emails', email);
    const headers = new HttpHeaders(
      { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}` });

    return this.http.get<any>(this.apiConfig.buildUrl('roles'), { params: parameters, headers }).pipe(
      map(response => {
        if (response.items.length > 0) {
          return this.convertRole(response.items[0].name);
        }
        return null;
      }),
      catchError(err => {
        console.error('Error fetching role:', err);
        return of(null);
      })
    );
  }
  
}