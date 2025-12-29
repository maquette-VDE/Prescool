import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/enum';

@Component({
  selector: 'app-confirme-consultant',
  imports: [],
  templateUrl: './confirme-consultant.html',
  styleUrl: './confirme-consultant.css',
})
export class ConfirmeConsultant {

  role: UserRole | null = null; 
  userRole = UserRole;
  constructor(private router : Router){}

  retour(){
    this.router.navigateByUrl('create-consultant')
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
}
