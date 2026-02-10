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
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-create-user',
  imports: [ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})
export class CreateUser {
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private store: Store,
  ) {}

  userForm!: FormGroup;
  role: UserRole | null = null;
  isConsultant: boolean = true;
  user$: any = {};
  user: User = new User('', '', '', '', UserRole.CONSULTANT);

  showPassword = false;
  hasBlurredOnce = false;
  hasTypedPassword = false; // vrai si l'utilisateur a saisi quelque chose
  isPasswordFocused = false; // vrai si l'input est focus

  toExpert() {
    this.role = UserRole.INSTRUCTEUR;
    this.isConsultant = false;
  }

  toConsultant() {
    this.role = UserRole.CONSULTANT;
    this.isConsultant = true;
  }

  ngOnInit() {
    this.store.pipe(select(selectStep1User)).subscribe((userData) => {
      this.user.last_name = userData.last_name || '';
      this.user.first_name = userData.first_name || '';
      this.user.email = userData.email || '';
      this.user.phone = userData.phone || '';
    });

    this.userForm = this.formBuilder.group(
      {
        last_name: [this.user.last_name, Validators.required],
        first_name: [this.user.first_name, Validators.required],
        email: [this.user.email, [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
        phone: [this.user.phone],
      },
      { validators: passwordMatchValidator },
    );

    this.store.pipe(select(selectRole)).subscribe((role) => {
      this.role = role || UserRole.CONSULTANT;
    });

    if (this.role === UserRole.CONSULTANT) {
      this.toConsultant();
    } else if (this.role === UserRole.INSTRUCTEUR) {
      this.toExpert();
    }

    console.log('Current role : ', this.role);
    console.log(' user is : ', this.user$);
  }

  login() {
    if (!this.role) {
      return;
    }

    this.router.navigate(['login'], { queryParams: { role: this.role } });
  }

  hasError(controlName: string, error: string) {
    const control = this.userForm.get(controlName);
    // Si le champ est vide, on ne veut pas afficher de message
    if (!control?.value) return false;
    return control?.touched && control?.hasError(error);
  }

  suivant() {
    if (this.userForm.valid) {
      this.store.dispatch(
        registerUser({
          last_name: this.userForm.value.last_name,
          first_name: this.userForm.value.first_name,
          email: this.userForm.value.email,
          phone: this.userForm.value.phone,
          password: this.userForm.value.password,
        }),
      );

      this.store.dispatch(actualRole({ role: this.role as UserRole }));

      if (this.role === UserRole.CONSULTANT) {
        this.router.navigateByUrl('confirm-consultant');
      } else if (this.role === UserRole.INSTRUCTEUR) {
        this.router.navigateByUrl('confirm-expert');
      }
    }
  }

  onPasswordBlur() {
    this.isPasswordFocused = false;
    if (this.hasTypedPassword) {
      this.hasBlurredOnce = true;
    }
  }

  hasPhoneError() {
    const control = this.userForm.get('phone');
    if (!control?.value) return false;
    const pattern = /^0\d{9}$/;
    return control.touched && !pattern.test(control.value);
  }

  blockNonDigits(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onPhonePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digitsOnly = pasted.replace(/\D/g, '');
    this.userForm.get('phone')?.setValue(digitsOnly);
  }
}

