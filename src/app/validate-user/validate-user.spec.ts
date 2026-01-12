import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValiderUser } from './validate-user';

describe('ValiderUser', () => {
  let component: ValiderUser;
  let fixture: ComponentFixture<ValiderUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValiderUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValiderUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
