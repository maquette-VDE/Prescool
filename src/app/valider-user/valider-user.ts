import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RegisterService } from '../services/register.service';
import RegisterTrialService from '../services/registerTrial.service';

@Component({
  selector: 'app-valider-user',
  imports: [
    NgFor
  ],
  templateUrl: './valider-user.html',
  styleUrl: './valider-user.css',
})
export class ValiderUser {
rejectUser(arg0: any) {
throw new Error('Method not implemented.');
}
  constructor(
    private subscribeService: RegisterService,
    private attenteService: RegisterTrialService
  ) {}
  users: any[] = [];

  ngOnInit() {
    this.users= this.attenteService.getUsers();
    console.log(this.users);
  }
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
