import {UserRole} from './userRole';

export interface User {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

export class User implements User {
  constructor(
    email: string,
    nom: string,
    prenom: string,
    password: string,
    role: UserRole,
    phone?: string,
    id?: string,
    ) {
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.password = password;
        this.role = role;
        this.phone = phone;
        this.id = id;
    }
}
