import { User } from "./user";
import { UserRole } from "./userRole";

export interface Expert extends User {
    diplome: string;
}

export class Expert extends User implements Expert {
    constructor(
        diplome: string,
        
        email: string,
        first_name: string,
        last_name: string,
        password: string,
        role: UserRole[],
        phone?: string,
    ) {
        super(email, first_name, last_name, password, role, phone);
        this.diplome = diplome;
    }
}