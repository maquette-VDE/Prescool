import {UserRole} from './userRole';

export interface User {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole [];
}

export class User implements User {
  constructor(
    email: string,
    last_name: string,
    first_name: string,
    password: string,
    role: UserRole [],
    phone?: string,
    ) {
        this.email = email;
        this.last_name = last_name;
        this.first_name = first_name;
        this.password = password;
        this.role = role;
        this.phone = phone;
    }
}
