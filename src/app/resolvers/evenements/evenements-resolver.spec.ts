import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { dashboardEvenementsResolver } from './evenements-resolver';
import { UserEvent } from '../../interfaces/events';

describe('dashboardEvenementsResolver', () => {
  const executeResolver: ResolveFn<UserEvent[]> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => dashboardEvenementsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
