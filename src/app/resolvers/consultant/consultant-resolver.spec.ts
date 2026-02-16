import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { consultantResolver } from './consultant-resolver';

describe('consultantResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => consultantResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
