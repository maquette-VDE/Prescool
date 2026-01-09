import { Injectable } from "@angular/core";
import { UserRole } from "../models/userRole";

@Injectable({
  providedIn: 'root'//enregistre à la racine de l'application
})

export class RoleService {
  constructor() {}

  convertRole(roleStr: string): UserRole | null {
    switch(roleStr.toLowerCase()) {
      case 'student':
        return UserRole.CONSULTANT;
      case 'encadrant':
        return UserRole.EXPERT;
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
      default:
        return '';
    }
  }


}