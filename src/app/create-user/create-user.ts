import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../validators/confirm-password.validator';
import { NgClass } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { selectRole, selectStep1User, selectUserDataState } from '../store/register.selectors';
import { actualRole, registerUser } from '../store/register.actions';
import { User } from '../models/user';

@Component({
  selector: 'app-create-user',
  imports: [
    ReactiveFormsModule, NgClass
  ],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})

export class CreateUser {

  constructor(
    private router : Router, 
    private formBuilder: FormBuilder, 
    private store: Store,
  ){}

  userForm!: FormGroup;
  role: UserRole | null = null; 
  isConsultant : boolean = true;
  user$ : any = {};
  user : User = new User('','','','',UserRole.CONSULTANT);

  toExpert(){
    this.role = UserRole.EXPERT;
    this.isConsultant = false;
  }

  toConsultant(){
    this.role = UserRole.CONSULTANT;
    this.isConsultant = true;
  }

  ngOnInit() {
    
    this.store.pipe(select(selectStep1User)).subscribe(userData => {
      this.user.last_name = userData.last_name ||'';
      this.user.first_name = userData.first_name ||'';
      this.user.email = userData.email ||'';
      this.user.phone = userData.phone ||'';
      
    });

    this.userForm = this.formBuilder.group({
      last_name: [ this.user.last_name, Validators.required],
      first_name: [ this.user.first_name, Validators.required],
      email: [ this.user.email, [Validators.required, Validators.email]],
      password: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['', Validators.required],
      phone: [ this.user.phone],
    }, { validators: passwordMatchValidator, updateOn: 'blur' });

    this.store.pipe( select(selectRole) ).subscribe(role => {
      this.role = role || UserRole.CONSULTANT;
    });
    
    if (this.role === UserRole.CONSULTANT) {
      this.toConsultant();
    } else if (this.role === UserRole.EXPERT) {
      this.toExpert();
    } 

    console.log('Current role : ', this.role);
    console.log(' user is : ', this.user$);
    
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

  hasError(controlName: string, error: string) {
    const control = this.userForm.get(controlName);
    return control?.touched && control?.hasError(error);
  }
  
  suivant(){
    if (this.userForm.valid) {

      this.store.dispatch(registerUser({
        last_name: this.userForm.value.last_name,
        first_name: this.userForm.value.first_name,
        email: this.userForm.value.email,
        phone: this.userForm.value.phone,
        password: this.userForm.value.password
      }));

      this.store.dispatch(actualRole({ role: this.role as UserRole }));

      if (this.role === UserRole.CONSULTANT) {
        this.router.navigateByUrl('confirm-consultant');
        
      } else if (this.role === UserRole.EXPERT) {
        this.router.navigateByUrl('confirm-expert');
      }
    }
  }
}

