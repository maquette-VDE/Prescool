import { Component, inject, OnInit, signal} from '@angular/core';
import { ActivatedRoute, RouterLink  } from '@angular/router';
import { AnnonceService } from '../annonces/annonce.service';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-annonce-detail',
  standalone: true,
  imports: [DatePipe, CommonModule, RouterLink],
  templateUrl: './annonce-detail.html'
})
export class AnnonceDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(AnnonceService);
  
  // ICI : On ne prend qu'UN SEUL projet, pas la liste
  projet = signal<any>(null);

  ngOnInit() {
    // On récupère l'ID passé dans l'URL (/annonces/1)
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    // On cherche l'unique projet correspondant
    const found = this.service.getAnnonces()().find(p => p.id === id);
    this.projet.set(found);
  }
}