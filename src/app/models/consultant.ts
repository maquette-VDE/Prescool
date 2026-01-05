import { User } from "./user";
import { UserRole } from "./userRole";

export interface Consultant extends User {
  code: string;
  dateArrivee: Date;
  
}

export class Consultant extends User implements Consultant {
  constructor(
    code: string,
    dateArrivee: Date,

    email: string,
    nom: string,
    prenom: string,
    password: string,
    role: UserRole,
    phone?: string,
    id?: string,
    
    ) {
        super(email, nom, prenom, password, role, phone, id);
        this.code = code;
        this.dateArrivee = dateArrivee;
    }
}