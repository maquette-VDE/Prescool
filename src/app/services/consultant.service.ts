import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Consultant {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultantService {
  private http = inject(HttpClient);

  private consultantsSignal = signal<Consultant[]>([]);

  loadConsultants() {
    this.http.get<Consultant[]>('http://localhost:8080/api/consultants')
      .subscribe(data => this.consultantsSignal.set(data));
  }

  getConsultants() {
    return this.consultantsSignal.asReadonly();
  }

  consultantsCount = computed(() =>
    this.consultantsSignal().length
  );
}