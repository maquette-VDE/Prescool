import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../validators/confirm-password.validator';
import { NgClass } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { selectRole, selectStep1User, selectUserDataState } from '../store/register.selectors';
import { actualRole, registerUser } from '../store/register.actions';

@Component({
  selector: 'app-create-user',
  imports: [
    ReactiveFormsModule, NgClass
  ],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})

export class CreateUser {
  userForm!: FormGroup;
  role: UserRole | null = null; 
  isConsultant : boolean = true;
  constructor(
    private router : Router, 
    private formBuilder: FormBuilder, 
    private store: Store
  ){}

  toExpert(){
    this.role = UserRole.EXPERT;
    this.isConsultant = false;
  }

  toConsultant(){
    this.role = UserRole.CONSULTANT;
    this.isConsultant = true;
  }

  ngOnInit() {

    this.userForm = this.formBuilder.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['', Validators.required],
      phone: ['',],
    }, { validators: passwordMatchValidator, updateOn: 'blur' });

    this.store.pipe(select(selectStep1User)).subscribe(userData => {
      this.userForm.patchValue({
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password
      });
    });

    this.store.pipe( select(selectRole) ).subscribe(role => {
      this.role = role;
    });

    if (this.role === UserRole.CONSULTANT) {
      this.toConsultant();
    } else if (this.role === UserRole.EXPERT) {
      this.toExpert();
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

  hasError(controlName: string, error: string) {
    const control = this.userForm.get(controlName);
    return control?.touched && control?.hasError(error);
  }
  
  suivant(){
    if (this.userForm.valid) {

      this.store.dispatch(registerUser({
        id:'',
        nom: this.userForm.value.nom,
        prenom: this.userForm.value.prenom,
        email: this.userForm.value.email,
        phone: this.userForm.value.phone,
        password: this.userForm.value.password
      }));

      this.store.dispatch(actualRole({ role: this.role as UserRole }));

      if (this.role === UserRole.CONSULTANT) {
        this.router.navigateByUrl('confirme-consultant');
      } else if (this.role === UserRole.EXPERT) {
        this.router.navigateByUrl('confirme-expert');
      }
    }
  }
}

