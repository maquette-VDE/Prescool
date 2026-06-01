import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnnouncementService } from '../services/announcement/announcement.service';

@Component({
  selector: 'app-annonces-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './annonces-panel.html',
  styleUrls: ['./annonces-panel.css']
})
export class AnnoncesPanelComponent implements OnInit {
  annonces: any[] = [];

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    this.announcementService.getAnnonces().subscribe({
      next: (data) => {
        console.log('--- STRUCTURE REÇUE ---', data);
        this.annonces = data.map(a => ({
          ...a,
          image_url: a.image_url && !a.image_url.startsWith('http') 
                     ? 'http://localhost:1337' + a.image_url 
                     : a.image_url
        }));
      },
      error: (err) => console.error('Erreur lors de la récupération:', err)
    });
  }

  handleImageError(event: any) {
    event.target.src = 'https://placehold.co/600x400?text=Image+Indisponible';
  }
}