import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { instructorsResolver } from './instructors-resolver';
import { UserApiResponse } from '../../models/user-api.model';

describe('instructorsResolver', () => {
  const executeResolver: ResolveFn<UserApiResponse> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      instructorsResolver(...resolverParameters),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
