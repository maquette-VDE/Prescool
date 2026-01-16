import { User } from "./user";
import { UserRole } from "./userRole";

export interface Consultant extends User {
  code: string;
  arrivedAt: Date;
  gotMission: boolean;
  
}

export class Consultant extends User implements Consultant {
  constructor(
    code: string,
    arrivedAt: Date,
    gotMission: boolean,

    email: string,
    first_name: string,
    last_name: string,
    password: string,
    role: UserRole,
    phone?: string,
    
    ) {
        super(email, first_name, last_name, password, role, phone);
        this.code = code;
        this.arrivedAt = arrivedAt;
        this.gotMission = gotMission;
    }
}