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
        id?: number,
    ) {
        super(email, nom, prenom, password, role, phone, id);
        this.diplome = diplome;
    }
}