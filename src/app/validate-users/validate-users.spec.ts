import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateUsers } from './validate-users';

describe('ValidateUsers', () => {
  let component: ValidateUsers;
  let fixture: ComponentFixture<ValidateUsers>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
