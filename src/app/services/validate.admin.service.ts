import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class ValidateAdminService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}
  validateUser() {
    this.http.post<any>(this.apiConfig.buildUrl('auth/invitation-codes'), {}).subscribe();
  }
}
