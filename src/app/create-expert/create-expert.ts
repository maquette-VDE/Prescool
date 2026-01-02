import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserRole } from '../models/userRole';

@Component({
  selector: 'app-creation-expert',
  imports: [],
  templateUrl: './create-expert.html',
  styleUrl: './create-expert.css'
})
export class CreateExpert {

  role: UserRole | null = null; 
    userRole = UserRole;

  constructor(private router : Router){}

  suivant(){
    this.router.navigateByUrl('confirme-expert')
  }

  toExpert(){
    this.router.navigateByUrl('/create-expert')
  }

  toConsultant(){
    this.router.navigateByUrl('/create-consultant')
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
