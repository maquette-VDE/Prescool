import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { evenementsResolver } from './evenements-resolver';
import { UserEvent } from '../../interfaces/events';

describe('evenementsResolver', () => {
  const executeResolver: ResolveFn<UserEvent[]> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => evenementsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
