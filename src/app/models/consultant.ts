import { User } from "./user";
import { UserRole } from "./userRole";

export interface Consultant extends User {
  code: string;
  arrivedAt: Date;
  
}

export class Consultant extends User implements Consultant {
  constructor(
    code: string,
    arrivedAt: Date,

    email: string,
    nom: string,
    prenom: string,
    password: string,
    role: UserRole,
    phone?: string,
    id?: number,
    
    ) {
        super(email, nom, prenom, password, role, phone, id);
        this.code = code;
        this.arrivedAt = arrivedAt;
    }
}