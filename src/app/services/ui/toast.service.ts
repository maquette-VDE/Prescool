import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // On utilise des Signals pour une réactivité optimale
  public show = signal(false);
  public message = signal('');
  public type = signal<'success' | 'error'>('success');

  private timeoutId: any;

  /**
   * Déclenche l'apparition du toast
   * @param msg Le texte à afficher
   * @param toastType 'success' ou 'error'
   */
  trigger(msg: string, toastType: 'success' | 'error' = 'success') {
    // Si un toast est déjà en cours, on l'annule pour recommencer le chrono
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.message.set(msg);
    this.type.set(toastType);
    this.show.set(true);

    // Fermeture automatique après 3 secondes
    this.timeoutId = setTimeout(() => {
      this.show.set(false);
    }, 3000);
  }
}