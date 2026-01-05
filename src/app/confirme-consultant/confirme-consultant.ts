import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Consultant } from '../models/consultant';
import { Store } from '@ngrx/store';
import { selectRole, selectStep1User, selectStep2Consultant } from '../store/register.selectors';
import { SubscribeService } from '../services/subscribe.service';
import { actualRole, registerConsultant } from '../store/register.actions';

@Component({
  selector: 'app-confirme-consultant',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './confirme-consultant.html',
  styleUrl: './confirme-consultant.css',
})

export class ConfirmeConsultant {
  
  constructor(private router : Router,
              private formBuilder: FormBuilder,
              private auth: AuthService,
              private store: Store,
              private subscriptionService: SubscribeService
  ){}

  role: UserRole | null = null; 
  consultantForm!: FormGroup;  
  user$!: any;

  ngOnInit() {
    this.store.select(selectStep2Consultant).subscribe(userData => {
      this.user$.code = userData.code || '';
      this.user$.dateArrivee = userData.dateArrivee || '';
    });
    
    this.store.select(selectRole).subscribe(role => {
      this.role = role;
    });

    this.consultantForm = this.formBuilder.group({
      code: [this.user$.code, Validators.required],
      dateArrivee: [this.user$.dateArrivee, Validators.required]
    }); 
  }

  
  retour(){
    this.store.dispatch(registerConsultant({ 
      code: this.consultantForm.value.code || '',
      dateArrivee: this.consultantForm.value.dateArrivee || ''
    }));
    this.store.dispatch(actualRole({ role: UserRole.CONSULTANT }));
    this.router.navigateByUrl('create-user');
    
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
      console.error('Role is not defined');
      return; 
    }
    this.store.select(selectStep1User).subscribe(userData => {
      this.user$.id = userData.id || '';
      this.user$.nom = userData.nom ;
      this.user$.prenom = userData.prenom ;
      this.user$.email = userData.email ;
      this.user$.password = userData.password;
      this.user$.phone = userData.phone || '';
      this.user$.role = this.role;
    });
    this.subscriptionService.inscription( this.user$ as Consultant ).subscribe({
      next: () => console.log('Consultant data for inscription:', this.user$),
      error: (err1) => console.error('Inscription failed',err1)
    });
    this.auth.login(this.user$.email, this.user$.password).subscribe({
      next: () => this.router.navigateByUrl('presences'),
      error: (err) => console.error('inscription to Login failed', err)
    });
    this.router.navigateByUrl('login?role=consultant');
  }

  hasError(controlName: string, error: string) {
    const control = this.consultantForm.get(controlName);
    return control?.touched && control?.hasError(error);
  }

}