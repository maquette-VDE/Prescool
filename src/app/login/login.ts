import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserRole } from '../models/userRole';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  constructor(private router : Router, private route : ActivatedRoute ,private auth : AuthService){}

  
  role: UserRole | null = null; 
  userRole = UserRole;
  signupLink : string | null = null
  email: string = '';
  password: string = '';


  ngOnInit() {
  this.route.queryParams.subscribe(params => {
    const roleParam = params['role'];

    if (roleParam === UserRole.CONSULTANT || roleParam === UserRole.EXPERT) {
      this.role = roleParam;
    } else {
      this.role = null;  
    }

    if (this.role === UserRole.CONSULTANT) {
        this.signupLink = '/create-user';
      } else if (this.role === UserRole.EXPERT) {
        this.signupLink = '/create-user';
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

  onLogin() {
     if (this.role === UserRole.CONSULTANT) {
          this.auth.login(this.email, this.password).subscribe({
          next: () => this.router.navigateByUrl('presences'),
          error: (err) => console.error('Login failed', err)
        });
  
      } else if (this.role === UserRole.EXPERT) {
          this.auth.login(this.email, this.password).subscribe({
          next: () => this.router.navigateByUrl('presences'),
          error: (err) => console.error('Login failed', err)
        });
      } 
  }

}
