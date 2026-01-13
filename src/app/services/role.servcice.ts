import { Injectable } from "@angular/core";
import { UserRole } from "../models/userRole";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'//enregistre à la racine de l'application
})

export class RoleService {
  constructor(
    private http: HttpClient
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
}