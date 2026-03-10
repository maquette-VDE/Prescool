import { Injectable, signal } from '@angular/core';
import { Annonce } from '../models/annonce.model';


@Injectable({ providedIn: 'root' })
export class AnnonceService {
private projetsList = signal<Annonce[]>([
  {
    id: 1,
    titre: 'Refonte CRM Isoset',
    description: 'Migration de l’infrastructure vers Angular 18 et optimisation des requêtes SQL.',
    imageUrl: 'images/crm-project.png',
    date: new Date('2024-03-01'),
    categorie: 'Développement Web'
  },
  {
    id: 2,
    titre: 'Application Mobile Prescool',
    description: 'Création d’une interface de suivi pour les parents et gestion des absences en temps réel.',
    imageUrl: 'images/mobile-app.png',
    date: new Date('2024-02-15'),
    categorie: 'Mobile iOS/Android'
  },
  {
    id: 3,
    titre: 'Dashboard Statistique',
    description: 'Analyse prédictive des ventes avec intégration de graphiques dynamiques (Chart.js).',
    imageUrl: 'images/stats-dash.png',
    date: new Date('2024-03-05'),
    categorie: 'Data Visualization'
  }
]);

  getAnnonces() {
    return this.projetsList.asReadonly();
  }
}