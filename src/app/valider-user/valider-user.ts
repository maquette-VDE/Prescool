import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RegisterService } from '../services/register.service';

@Component({
  selector: 'app-valider-user',
  imports: [
    NgFor
  ],
  templateUrl: './valider-user.html',
  styleUrl: './valider-user.css',
})
export class ValiderUser {
  constructor(
    private subscribeService: RegisterService,

  ) {}
  users: any[] = [];
validateUser(arg0: any) {
  this.subscribeService.inscription(arg0).subscribe({
    next: (response) => {

    },
    error: (error) => {
      console.error('There was an error during the request', error.error);
    }
  });
}

}
