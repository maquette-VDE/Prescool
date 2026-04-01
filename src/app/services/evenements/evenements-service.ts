import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UserEvent } from '../../interfaces/events';


@Injectable({
  providedIn: 'root',
})
export class EvenementsService {
  private readonly http = inject(HttpClient);

  readonly limit = 100;

  getEvenementsActifsToday(): Observable<UserEvent[]> {
    const now = new Date();

  const startOfDayUtc = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));

  const endOfDayUtc = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    23, 59, 59, 999
  ));


     const url =
      `https://prez-cool-staging.appsolutions224.com/api/v1/events` +
      `?event_start_from=${encodeURIComponent(startOfDayUtc.toISOString())}` +
      `&event_end_to=${encodeURIComponent(endOfDayUtc.toISOString())}` +
      `&limit=${this.limit}`;

    return this.http
      .get<any>(url)
      .pipe(map((response) => response.items as UserEvent[]));
  }
}
