import { UserRole } from "../models/userRole";

export interface UserDataState {
    id?: string;
    email: string;
    password: string;
    nom: string;
    prenom: string; 
    phone?: string;
    role: UserRole;
    diplome?: string;
    code?: string;
    dateArrivee?: Date;
    step: number;
}

export const initialUserDataState: UserDataState = {
    id: undefined,
    email: '',
    password: '',
    nom: '',
    prenom: '',
    phone: undefined,
    role: UserRole.CONSULTANT,
    diplome: undefined,
    code: undefined,
    dateArrivee: undefined,
    step: 1,
};
