import { Component, inject, signal } from '@angular/core';
import { AnnonceService } from './annonce.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-annonce',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './annonces.html',
  styleUrl: './annonces.css'
})
export class Annonces {
  private annonceService = inject(AnnonceService);
  annonces = this.annonceService.getAnnonces();

  projetSelectionne = signal<any>(null);

selectionner(p: any) {
  this.projetSelectionne.set(p);
}
}