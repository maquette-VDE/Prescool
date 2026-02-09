import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { Store } from '@ngrx/store';
import { actualRole } from '../store/register.actions';

@Component({
  selector: 'app-acceuil',
  imports: [],
  templateUrl: './acceuil.html',
  styleUrl: './acceuil.css',
})
export class Acceuil {

  constructor(
    private router: Router,
    private store: Store
  ) { }

  UserRole = UserRole;

  login(type: UserRole) {
    this.router.navigate(
      ['login'],
      { queryParams: { role: type } }
    );
  }

  createExperts() {
    this.store.dispatch(actualRole({ role: UserRole.EXPERT }));
    this.router.navigateByUrl('create-user')
  }

  createConsultant() {
    this.store.dispatch(actualRole({ role: UserRole.CONSULTANT }));
    this.router.navigateByUrl('create-user')
  }
}
