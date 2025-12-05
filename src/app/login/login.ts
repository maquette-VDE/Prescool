import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { service } from '../services/service';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  constructor(private router : Router, private auth : service){}

  login(){
    const data = this.auth.getData()
    console.log(data)
  }

}
