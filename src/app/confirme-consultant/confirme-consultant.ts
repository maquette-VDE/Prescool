import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { Consultant } from '../models/consultant';
import { Store } from '@ngrx/store';
import { selectRole, selectStep2Consultant } from '../store/register.selectors';
import { actualRole, registerConsultant } from '../store/register.actions';
import { User } from '../models/user';
import { RegisterService } from '../services/auth/register.service';

@Component({
  selector: 'app-confirme-consultant',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './confirme-consultant.html',
  styleUrl: './confirme-consultant.css',
})

export class ConfirmeConsultant {
  codeNotUnique: boolean= false;
  
  constructor(private router : Router,
              private formBuilder: FormBuilder,
              private store: Store,
              private subscriptionService: RegisterService,
              private auth: AuthService
  ){}

  role: UserRole | null = null; 
  consultantForm!: FormGroup;  
  user: User = new User('','','','',UserRole.CONSULTANT);
  consultant: Consultant = new Consultant('',new Date(),false,'','','','',UserRole.CONSULTANT);
  mission: boolean = false;
  ngOnInit() {
    this.store.select(selectStep2Consultant).subscribe(userData => {
      this.consultant.code = userData.code || '';
      this.consultant.arrivedAt = userData.arrivedAt || new Date();
    });
    
    this.store.select(selectRole).subscribe(role => {
      this.role = role;
    });

    this.consultantForm = this.formBuilder.group({
      code: [this.consultant.code, Validators.required],
      arrivedAt: [this.consultant.arrivedAt, [Validators.required, Validators.pattern(`^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}$`)]],
      gotMission: [false]
    }); 
  }

  
  retour(){
    this.store.dispatch(registerConsultant({ 
      code: this.consultantForm.value.code || '',
      arrivedAt: this.consultantForm.value.arrivedAt || '',
      gotMission: this.consultantForm.value.gotMission || false
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
    console.log('Inscription for role : ', this.role);

    this.consultant = this.subscriptionService.initialize(
      this.consultant, 
      this.store, 
      this.role, 
      this.consultantForm) as Consultant;
      
    this.subscriptionService.inscription( this.consultant ).subscribe({
      next: () => {
        console.log('Consultant data for inscription:', this.consultant);
        this.router.navigateByUrl('attente-confirmation');
      }, 
        error: (err1) => console.error('Inscription failed', err1.error)
    });
    
  }

  hasError(controlName: string, error: string) {
    const control = this.consultantForm.get(controlName);
    return control?.touched && control?.hasError(error);
  }

}