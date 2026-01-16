import { UserRole } from "../models/userRole";

export interface UserDataState {
    email: string;
    password: string;
    last_name: string;
    first_name: string; 
    phone?: string;
    role: UserRole;
    diplome?: string;
    code?: string;
    arrivedAt?: Date;
    gotMission?: boolean;
    step: number;
}

export const initialUserDataState: UserDataState = {
    email: '',
    password: '',
    last_name: '',
    first_name: '',
    phone: undefined,
    role: UserRole.CONSULTANT,
    diplome: undefined,
    code: undefined,
    arrivedAt: undefined,
    gotMission: false,
    step: 1,
};
