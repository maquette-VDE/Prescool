import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UsersApiResponse } from '../../interfaces/userItem';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);

  getUsers(url: string): Observable<UsersApiResponse> {
    return this.http
      .get<any>(url)
      .pipe(map((response) => response as UsersApiResponse));
  }

  normalize(str: string) {
    return str
      .replace(/^"+|"+$/g, '') // supprimer guillemets au début et à la fin
      .normalize('NFD') // séparer les accents
      .replace(/[\u0300-\u036f]/g, '') // enlever accents
      .replace(/[\u200B-\u200F]/g, '') // enlever caractères invisibles
      .trim() // enlever espaces
      .toLowerCase(); // insensible à la casse
  }
}


