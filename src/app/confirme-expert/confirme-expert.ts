import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';

@Component({
  selector: 'app-confirme-expert',
  imports: [],
  templateUrl: './confirme-expert.html',
  styleUrl: './confirme-expert.css'
})
export class ConfirmeExpert {

  role: UserRole | null = null; 
  userRole = UserRole;
  subscriptionService: any;
  constructor(private router : Router){}

  retour(){
    this.router.navigateByUrl('create-expert')
  }

    ngOnInit() {
    
      const path = this.router.url; 
      if (path.includes('consultant')) {
        this.role = UserRole.CONSULTANT;
      } else if (path.includes('expert')) {
        this.role = UserRole.EXPERT;
      } else {
        this.role = null;
      }
    }
  
    login() {
    if (!this.role) {
      return; 
    }
    this.router.navigate(
      ['login'],
      { queryParams: {role: this.role } }
      );
    }

    inscription() {
      if (!this.role) {
        return; 
      }
      this.subscriptionService.inscription({      });
    }
}
