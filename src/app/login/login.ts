import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { service } from '../services/service';
import { UserRole } from '../models/enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  constructor(private router : Router, private route : ActivatedRoute ,private auth : service){}

  
  role: UserRole | null = null; 
  userRole = UserRole;
  signupLink : string | null = null



  ngOnInit() {
  this.route.queryParams.subscribe(params => {
    const roleParam = params['role'];

    if (roleParam === UserRole.CONSULTANT || roleParam === UserRole.EXPERT) {
      this.role = roleParam;
    } else {
      this.role = null;  
    }

    if (this.role === UserRole.CONSULTANT) {
        this.signupLink = '/create-consultant';
      } else if (this.role === UserRole.EXPERT) {
        this.signupLink = '/create-expert';
      } 
  });
  
}
  switchRole(role: UserRole) {
    this.role = role;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { role: role },
      queryParamsHandling: 'merge' // fusionne avec d'autres query params si nécessaire
    });
  }

  login() {
     if (this.role === UserRole.CONSULTANT) {
        this.signupLink = '/presences';
      } else if (this.role === UserRole.EXPERT) {
        this.signupLink = '/presences';
      } 
  }

}
