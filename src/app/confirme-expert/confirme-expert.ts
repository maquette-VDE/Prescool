import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { Store } from '@ngrx/store';
import { selectRole, selectStep1User } from '../store/register.selectors';
import { Expert } from '../models/expert';
import RegisterTrialService from '../services/registerTrial.service';

@Component({
  selector: 'app-confirme-expert',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './confirme-expert.html',
  styleUrl: './confirme-expert.css'
})
export class ConfirmeExpert {

  constructor(
    private router : Router,
    private userService: RegisterTrialService,
    private store: Store,
    private formBuilder: FormBuilder
  ){}

  user$!: any;
  expert: Expert = new Expert('','','','','',UserRole.EXPERT);
  role: UserRole | null = null; 
  expertForm!: FormGroup;

  ngOnInit() {
      
      this.store.select(selectRole).subscribe(role => {
        this.role = role;
      });

      this.expertForm = this.formBuilder.group({
        diplome : ['', Validators.required],
      });

    }
  
    retour(){

      this.router.navigateByUrl('create-user')
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
      // this.initializeExpertData();

      this.expert = this.userService.initialize(
        this.expert, 
        this.store, 
        this.role, 
        this.expertForm
      ) as Expert;

      this.userService.tryToRegister(this.expert);
      this.router.navigateByUrl('attente-confirmation');

      /*
      this.subscriptionService.inscription( this.expert as Expert ).subscribe({
        next: () => console.log('Expert data for inscription:', this.expert),
        error: (err1) => console.error('Inscription failed',err1)
      });
      */
      this.router.navigateByUrl('accueil');
    }
}
