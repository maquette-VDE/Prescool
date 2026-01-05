import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { SubscribeService } from '../services/subscribe.service';
import { Store } from '@ngrx/store';
import { selectRole, selectStep1User } from '../store/register.selectors';
import { Expert } from '../models/expert';

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
    private subscriptionService: SubscribeService,
    private store: Store,
    private formBuilder: FormBuilder
  ){}

  user$!: any;
  role: UserRole | null = null; 
  expertForm!: FormGroup;

  ngOnInit() {
      this.store.select(selectStep1User).subscribe(userData => {
        this.user$.nom = userData.nom;
        this.user$.prenom = userData.prenom;
        this.user$.email = userData.email;
        this.user$.phone = userData.phone || '';
        this.user$.password = userData.password;
      });
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
      this.store.select(selectStep1User).subscribe(userData => {
        this.user$.id = userData.id || '';
        this.user$.nom = userData.nom ;
        this.user$.prenom = userData.prenom ;
        this.user$.email = userData.email ;
        this.user$.password = userData.password;
        this.user$.phone = userData.phone || '';
        this.user$.role = this.role;
      });
      this.subscriptionService.inscription( this.user$ as Expert ).subscribe({
        next: () => console.log('Expert data for inscription:', this.user$),
        error: (err1) => console.error('Inscription failed',err1)
      });
      this.router.navigateByUrl('accueil');
    }
}
