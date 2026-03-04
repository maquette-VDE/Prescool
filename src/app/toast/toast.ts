import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/ui/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styles: [`
    .custom-toast {
      position: fixed;
      top: 25px;
      right: 25px;
      min-width: 300px;
      background: #1a1a1a;
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.3);
      z-index: 11000;
      transform: translateX(150%);
      transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .custom-toast.show {
      transform: translateX(0);
    }

    .custom-toast.error {
      border-left: 5px solid #ff4d4d;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: #00d1b2;
      width: 100%;
    }

    .custom-toast.error .toast-progress {
      background: #ff4d4d;
    }

    @keyframes toast-timeout {
      from { width: 100%; }
      to { width: 0%; }
    }

    .custom-toast.show .toast-progress {
      animation: toast-timeout 3s linear forwards;
    }
  `]
})
export class ToastComponent {
  public toastService = inject(ToastService);
}