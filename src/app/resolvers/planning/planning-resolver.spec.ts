import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { PlanningData, planningResolver } from './planning-resolver';

describe('planningResolver', () => {
  const executeResolver: ResolveFn<PlanningData> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      planningResolver(...resolverParameters),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
