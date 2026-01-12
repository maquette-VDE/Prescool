import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attente-confirmation',
  imports: [

  ],
  templateUrl: './wait-confirmation.html',
  styleUrl: './wait-confirmation.css',
})
export class WaitConfirmation {
  constructor(
    private router : Router,
  ) {}

  back() {
    this.router.navigateByUrl('accueil');
  }

  login() {
    this.router.navigateByUrl('login');
  }

}
