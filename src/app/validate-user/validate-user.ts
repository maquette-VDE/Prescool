import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RegisterService } from '../services/auth/register.service';
import { User } from '../models/user';

@Component({
  selector: 'app-valider-user',
  imports: [
    NgFor
  ],
  templateUrl: './validate-user.html',
  styleUrl: './validate-user.css',
})
export class ValiderUser {
rejectUser(arg0: any) {
throw new Error('Method not implemented.');
}
  constructor(
    private subscribeService: RegisterService,
  ) {}
  users: User[] = [];
  validateUser(email: string) {

  }
  ngOnInit() {
    console.log(this.users);
  }

}
