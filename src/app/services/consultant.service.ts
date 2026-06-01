import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Consultant {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultantService {
  private http = inject(HttpClient);

  private readonly API_URL = `${environment.apiBaseUrl}/consultants`;

  private consultantsSignal = signal<Consultant[]>([]);
  

  loadConsultants() {
    this.http.get<Consultant[]>(this.API_URL)
      .subscribe(data => this.consultantsSignal.set(data));
  }

  getConsultants() {
    return this.consultantsSignal.asReadonly();
  }

  consultantsCount = computed(() =>
    this.consultantsSignal().length
  );
}