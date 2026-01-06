import { UserRole } from "../models/userRole";

export interface UserDataState {
    email: string;
    password: string;
    nom: string;
    prenom: string; 
    phone?: string;
    role: UserRole;
    diplome?: string;
    code?: string;
    dateArrivee?: Date;
    euMission?: boolean;
    step: number;
}

export const initialUserDataState: UserDataState = {
    email: '',
    password: '',
    nom: '',
    prenom: '',
    phone: undefined,
    role: UserRole.CONSULTANT,
    diplome: undefined,
    code: undefined,
    dateArrivee: undefined,
    euMission: false,
    step: 1,
};
