import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { consultantResolver } from './consultant-resolver';
import { UsersApiResponse } from '../../interfaces/userItem';

describe('consultantResolver', () => {
  const executeResolver: ResolveFn<UsersApiResponse> = (
    ...resolverParameters
  ) =>
    TestBed.runInInjectionContext(() =>
      consultantResolver(...resolverParameters),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
