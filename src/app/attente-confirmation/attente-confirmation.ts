import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attente-confirmation',
  imports: [

  ],
  templateUrl: './attente-confirmation.html',
  styleUrl: './attente-confirmation.css',
})
export class AttenteConfirmation {
  constructor(
    private router : Router,
  ) {}

  retour() {
    this.router.navigateByUrl('accueil');
  }

  login() {
    this.router.navigateByUrl('login');
  }

}
