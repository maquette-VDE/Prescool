import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserRole } from '../models/userRole';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../services/role.servcice';

@Component({
  selector: 'app-login',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  constructor(
    private router : Router,
    private route : ActivatedRoute ,
    private auth : AuthService,
    private roleService : RoleService,
  ){}

  role: UserRole | null = null;
  userRole = UserRole;
  signupLink : string | null = null
  email: string = '';
  password: string = '';

  showMessageErrorConnexion = false;


  ngOnInit() {
  this.route.queryParams.subscribe(params => {
    const roleParam = params['role'];

    if (roleParam === UserRole.CONSULTANT || roleParam === UserRole.EXPERT) {
      this.role = roleParam;
    } else {
      this.role = null;
    }
    this.signupLink = '/create-user';
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
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.roleService.getRole(this.email).subscribe(role => {
          this.role = role;
          this.router.navigateByUrl('sidenav/presences');
        });
      },
      error: (err) => {
        console.error('Login failed', err.error);
      }
    });
  }

}
