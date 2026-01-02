import { Consultant } from './../models/consultant';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ 
    providedIn: 'root' 
})

export class ConsultantService {
  private consultantSubject = new BehaviorSubject<Consultant | null>(null);

  userData$: Observable<Consultant | null> = this.consultantSubject.asObservable();

  setConsultantData(data: Consultant): void {
    this.consultantSubject.next(data);
  }

  getConsultantData(): Consultant | null {
    return this.consultantSubject.getValue();
  }

  clearConsultantData(): void {
    this.consultantSubject.next(null);
  }
  
}