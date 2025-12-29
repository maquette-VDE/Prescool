import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/enum';

@Component({
  selector: 'app-acceuil',
  imports: [],
  templateUrl: './acceuil.html',
  styleUrl: './acceuil.css',
})
export class Acceuil {

  constructor(private router: Router){}

  UserRole = UserRole;

  login(type: UserRole) {
  this.router.navigate(
    ['login'],
    { queryParams: { role: type } }
    );
  }

  CreateExperts(){
    this.router.navigateByUrl('create-expert')
  }

  CreateConsultant(){
    this.router.navigateByUrl('create-consultant')
  }


}
