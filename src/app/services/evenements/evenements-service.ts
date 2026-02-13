import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UserEvent } from '../../interfaces/events';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class EvenementsService {
  private readonly http = inject(HttpClient);

  now = new Date();

  year = this.now.getFullYear();
  month = String(this.now.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
  day = String(this.now.getDate()).padStart(2, '0');

  toDay = `${this.year}-${this.month}-${this.day}`;
  // toDay = '2026-02-10';

  readonly limit = 100;

  getEvenements(): Observable<UserEvent[]> {
    console.log('ToDay:', this.toDay);
    return this.http
      .get<any>(
        `https://prez-cool-staging.appsolutions224.com/api/v1/events?start_from=${this.toDay}&limit=${this.limit}`,
      )
      .pipe(map((response) => response.items as UserEvent[]));
  }
}
