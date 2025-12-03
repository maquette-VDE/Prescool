import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceuil',
  imports: [],
  templateUrl: './acceuil.html',
  styleUrl: './acceuil.css',
})
export class Acceuil {

  constructor(private router: Router){}

  login(){
    this.router.navigateByUrl('login')
  }

  CreateExperts(){
    this.router.navigateByUrl('create-expert')
  }

  CreateConsultant(){
    this.router.navigateByUrl('create-consultant')
  }

}
