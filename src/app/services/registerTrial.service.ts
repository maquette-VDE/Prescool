import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { UserRole } from '../models/userRole';
import { Store } from '@ngrx/store';
import { Consultant } from '../models/consultant';
import { Expert } from '../models/expert';
import { selectStep1User } from "../store/register.selectors";
import { FormGroup } from '@angular/forms';


@Injectable({
  providedIn: 'root',
})
export default class RegisterTrialService {
  users$ : (Consultant | Expert)[] = [];

  constructor(
    private store: Store
  ) {}

  initialize(user: Consultant | Expert, store : Store, role : UserRole, form : FormGroup): Consultant | Expert {
    
    store.select(selectStep1User).subscribe( userData => {
      user.nom = userData.nom ;
      user.prenom = userData.prenom ;
      user.email = userData.email ;
      user.password = userData.password;
      user.phone = userData.phone || '';
      user.role = role;
    });

    if (role === UserRole.CONSULTANT) {
      const consultant = user as Consultant;
      consultant.code = form.value.code || '';
      consultant.dateArrivee = form.value.dateArrivee || new Date();
      consultant.euMission = form.value.euMission || false;
      return consultant;
    } 
    else {
      const expert = user as Expert;
      expert.diplome = form.value.diplome || '';
      return expert;
    }
  }

  getUsers(): User[] {
    return this.users$;
  }

  addUser(userForm: (Consultant & Expert)): User[] {
    const user: User = {
      nom: userForm.nom,
      prenom: userForm.prenom,
      email: userForm.email,
      phone: userForm.phone,
      password: userForm.password,
      role: userForm.role,
    };
    if (userForm.role !== UserRole.CONSULTANT) {
     const newUser: Consultant = {
        ...user,
        code: userForm.code,
        dateArrivee: userForm.dateArrivee,
        euMission: userForm.euMission,
      };
      this.users$.push(newUser);
      return this.users$;
    } else {
      const newUser: Expert = {
        ...user,
        diplome: userForm.diplome,
      };
      this.users$.push(newUser);
      return this.users$;
    }
  }

  verifyUniqueEmail(email: string): boolean {
    return !this.users$.some(user => user.email === email);
  }

  verifyUniqueCode(code: string): boolean {
    return !this.users$.some(user => 
      (user.role === UserRole.CONSULTANT && (user as Consultant).code === code)
    );
  }

  removeUser(email: string): User[] {
    this.users$ = this.users$.filter(user => user.email !== email);
    return this.users$;
  }

  tryToRegister(userForm: any): void {
    this.addUser(userForm);
  }
}
