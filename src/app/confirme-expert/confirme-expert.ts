import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { Store } from '@ngrx/store';
import { selectRole, selectStep1User } from '../store/register.selectors';
import { Expert } from '../models/expert';
import { RegisterService } from '../services/register.service';

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
    private subscriptionService: RegisterService,
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

    initializeExpertData() {
      this.store.select(selectStep1User).subscribe(userData => {
        this.expert.nom = userData.nom;
        this.expert.prenom = userData.prenom;
        this.expert.email = userData.email;
        this.expert.phone = userData.phone || '';
        this.expert.password = userData.password;
      });
      this.expert.diplome = this.expertForm.value.diplome || '';
      this.expert.role = this.role || UserRole.EXPERT;
    }

    inscription() {
      if (!this.role) {
        console.error('Role is not defined');
        return; 
      }
      console.log('Inscription for role : ', this.role);
      // this.initializeExpertData();

      this.expert = this.subscriptionService.initialize(
        this.expert, 
        this.store, 
        this.role, 
        this.expertForm
      ) as Expert;
      this.subscriptionService.inscription( this.expert as Expert ).subscribe({
        next: () => console.log('Expert data for inscription:', this.expert),
        error: (err1) => console.error('Inscription failed',err1)
      });
      this.router.navigateByUrl('accueil');
    }
}
