import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserRole } from '../models/enum';

@Component({
  selector: 'app-create-consultant',
  imports: [],
  templateUrl: './create-consultant.html',
  styleUrl: './create-consultant.css',
})
export class CreateConsultant {

  role: UserRole | null = null; 
  userRole = UserRole;

   constructor(private router : Router){}

  suivant(){
    this.router.navigateByUrl('confirme-consultant')
  }

  toExpert(){
    this.router.navigateByUrl('create-expert')
  }

  toConsultant(){
    this.router.navigateByUrl('create-consulant')
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

