import { UserService } from './../services/user.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../models/userRole';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
//import { SubscribeService } from '../services/subscribe.service';
import { User } from '../models/user';
import { ConsultantService } from '../services/consultant.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-confirme-consultant',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './confirme-consultant.html',
  styleUrl: './confirme-consultant.css',
})

export class ConfirmeConsultant {
  subsicriptionService: any;
  constructor(private router : Router,
              private formBuilder: FormBuilder,
              private userService: UserService,
              private consultantService: ConsultantService,
              private auth: AuthService
  ){}

  role: UserRole | null = null; 
  consultantForm!: FormGroup;  
  user$!: any;

  retour(){
    this.router.navigateByUrl('create-consultant')
  }

  ngOnInit() {
    this.user$ = this.userService.userData$;
    
    this.consultantForm = this.formBuilder.group({
      code: ['', Validators.required],
      dateArrivee: ['', Validators.required]
    }, { updateOn: 'blur' });   
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
      return; 
    }
    this.consultantService.setConsultantData({
      nom: this.user$.nom,
      prenom: this.user$.prenom,
      email: this.user$.email,
      password: this.user$.password,
      phone: this.user$.phone,
      role: this.user$.role,
      code: this.consultantForm.value.code,
      arrivedAt: this.consultantForm.value.dateArrivee
    });
    this.subsicriptionService.inscription( this.consultantService.getConsultantData());
    this.auth.login(this.user$.email, this.user$.password).subscribe({
      next: () => this.router.navigateByUrl('presences'),
      error: (err) => console.error('Login failed', err)
    });
    this.router.navigateByUrl('login?role=consultant');
  }

}