import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { Store } from '@ngrx/store';
import { selectRole, selectStep1User } from '../store/register.selectors';
import { Expert } from '../models/expert';
import { RegisterService } from '../services/auth/register.service';
import { AuthService } from '../services/auth/auth.service';

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
    private store: Store,
    private formBuilder: FormBuilder,
    private subscriptionService: RegisterService,
  ){}

  user$!: any;
  expert: Expert = new Expert('','','','','',[UserRole.INSTRUCTEUR]);
  role: UserRole[] | null = null;
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

      this.expert = this.subscriptionService.initialize(
        this.expert,
        this.store,
        this.role,
        this.expertForm
      ) as Expert;

      this.subscriptionService.inscription( this.expert as Expert ).subscribe({
        next: () => {
          console.log('Expert data for inscription:', this.expert);
          this.router.navigateByUrl('wait-confirmation');
          },
        error: (err1) => console.error('Inscription failed',err1)
      });
    }
}
