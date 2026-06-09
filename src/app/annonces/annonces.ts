import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnnouncementService } from '../services/announcement/announcement.service';
import { SafeUrlPipe } from '../pipes/safe-url.pipe';
import { RouterModule, Router} from '@angular/router';

@Component({
  selector: 'app-annonce',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe, RouterModule],
  templateUrl: './annonces.html',
  styleUrls: ['./annonces.css']
})
export class AnnonceComponent implements OnInit {
  annonce: any;
  pageTitle: string = '';
  pageSubtitle: string = '';

  constructor(
    private route: ActivatedRoute,
    private announcementService: AnnouncementService
  ) {}
  

  

  ngOnInit(): void {
    const routeData = this.route.snapshot.data;
    this.pageTitle = routeData['title'] || 'Détail';
    this.pageSubtitle = routeData['subtitle'] || '';
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.announcementService.getAnnonceById(id).subscribe({
        next: (data) => {
          this.annonce = data;
          if (this.annonce && this.annonce.Titre) {
            this.pageTitle = this.annonce.Titre;
          }
        },
        error: (err) => console.error('Erreur lors du chargement de l\'annonce:', err)
      });
    }
  }
  fixImageUrl(url: string | undefined): string {
  return this.announcementService.fixImageUrl(url);
  }
  
  getMarkdownImageUrl(text: string): string | null {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/\((https?:\/\/[^)]+)\)/);
    return match ? match[1] : null;
  }

  isOnlyImageMarkdown(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    return text.trim().startsWith('![') && text.trim().endsWith(')');
  }
  // Dans ton fichier .ts
getKeys(obj: any): string {
  return obj ? Object.keys(obj).join(', ') : 'vide';
}
}