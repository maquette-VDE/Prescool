import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgTemplateOutlet } from '@angular/common';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-side-nav',
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    CommonModule,
    NgTemplateOutlet
  ],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.css',
})
export class SideNav {
  authService = inject(AuthService);
  user: any = null;

  onLogout() {
    this.authService.logout();
  }
  ngOnInit() {
    this.authService.user$.subscribe((data) => {
      this.user = data;
    });
  }

  hasRole(roleName: string): boolean {
  if (!this.user || !this.user.roles) return false;
  return this.user.roles.some((r: string) => 
    r.toLowerCase() === roleName.toLowerCase()
  );
}
}
