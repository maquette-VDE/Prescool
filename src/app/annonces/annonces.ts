import { Component, inject } from '@angular/core';
import { AnnonceService } from './annonce.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-annonce',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './annonces.html',
  styleUrl: './annonces.css'
})
export class Annonces {
  private annonceService = inject(AnnonceService);
  annonces = this.annonceService.getAnnonces();
}