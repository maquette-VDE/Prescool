import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { evenementsResolver } from './evenements-resolver';

describe('evenementsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => evenementsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
