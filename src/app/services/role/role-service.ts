import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectRole } from '../../store/register.selectors';

@Injectable({
  providedIn: 'root',
})
export class RoleService {

  private store = inject(Store);

  getRole$(): Observable<string> {
    const role$ = this.store.select(selectRole);
    return role$;
  }
}
