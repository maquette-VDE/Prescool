import { Injectable } from "@angular/core";
import { UserRole } from "../../models/userRole";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { ApiConfigService } from "../api-config.service";
import { catchError, map, Observable, of } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Injectable({
  providedIn: 'root'//enregistre à la racine de l'application
})

export class RoleService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private authService: AuthService
  ) {}

  toString(role: UserRole): string {
    switch(role) {
      case UserRole.CONSULTANT:
        return 'student';
      case UserRole.INSTRUCTEUR:
        return 'encadrant';
      case UserRole.ADMIN:
        return 'admin';
      default:
        return '';
    }
  }

  getRole(): Observable<UserRole[] | null> {
    const headers = new HttpHeaders(
      { Authorization: `Bearer ${this.authService.getToken() || ''}` });
      console.log('Fetching role with headers:', headers);
      return this.http.get<any>(this.apiConfig.buildUrl('users/me'), { headers }).pipe(
        map(response => {
          console.log('Response from /users/me:', response);
          if (response.roles && response.roles.length > 0) {
            console.log('User roles:', response.roles);
            return response.roles as UserRole[];
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
