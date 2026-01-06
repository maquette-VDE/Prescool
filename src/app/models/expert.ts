import { User } from "./user";
import { UserRole } from "./userRole";

export interface Expert extends User {
    diplome: string;
}

export class Expert extends User implements Expert {
    constructor(
        diplome: string,
        
        email: string,
        nom: string,
        prenom: string,
        password: string,
        role: UserRole,
        phone?: string,
    ) {
        super(email, nom, prenom, password, role, phone);
        this.diplome = diplome;
    }
}