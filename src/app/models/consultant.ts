import { User } from "./user";
import { UserRole } from "./userRole";

export interface Consultant extends User {
  code: string;
  dateArrivee: Date;
  euMission: boolean;
  
}

export class Consultant extends User implements Consultant {
  constructor(
    code: string,
    dateArrivee: Date,
    euMission: boolean,

    email: string,
    nom: string,
    prenom: string,
    password: string,
    role: UserRole,
    phone?: string,
    
    ) {
        super(email, nom, prenom, password, role, phone);
        this.code = code;
        this.dateArrivee = dateArrivee;
        this.euMission = euMission;
    }
}