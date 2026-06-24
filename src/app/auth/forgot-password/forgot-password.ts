import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule 
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent {
  email: string = '';
  isSubmitted: boolean = false;
  isLoading: boolean = false;

  constructor() {}

  onSubmit() {
    this.isLoading = true;
    console.log('Demande envoyée pour :', this.email);
    
    setTimeout(() => {
      this.isLoading = false;
      this.isSubmitted = true;
    }, 1500);
  }
}