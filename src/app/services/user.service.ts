import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ 
    providedIn: 'root' 
})

export class UserService {
  private userDataSubject = new BehaviorSubject<User | null>(null);

  userData$: Observable<User | null> = this.userDataSubject.asObservable();

  setUserData(data: User): void {
    this.userDataSubject.next(data);
  }

  clearUserData(): void {
    this.userDataSubject.next(null);
  }
}