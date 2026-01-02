import { UserService } from './../services/user.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../validators/confirm-password.validator';

@Component({
  selector: 'app-create-consultant',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './create-consultant.html',
  styleUrl: './create-consultant.css',
})
export class CreateConsultant {
  userForm!: FormGroup;
  role: UserRole | null = null; 
  userRole = UserRole;
  constructor(private router : Router, private formBuilder: FormBuilder, private userService: UserService){}

  suivant(){
    if (this.userForm.valid) {
      this.router.navigateByUrl('confirme-consultant');
      this.userService.setUserData({
        nom: this.userForm.value.nom,
        prenom: this.userForm.value.prenom,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        phone: this.userForm.value.phone,
        role: UserRole.CONSULTANT
      });
    }
  }

  toExpert(){
    this.router.navigateByUrl('create-expert')
  }

  toConsultant(){
    this.router.navigateByUrl('create-consulant')
  }

  ngOnInit() {
  this.userForm = this.formBuilder.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(20),Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$')]],
      confirmPassword: ['', Validators.required],
      phone: [''],
  }, { validators: passwordMatchValidator, updateOn: 'blur' });

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

