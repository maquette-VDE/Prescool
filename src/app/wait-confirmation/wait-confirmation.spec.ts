import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitConfirmation } from './wait-confirmation';

describe('WaitConfirmation', () => {
  let component: WaitConfirmation;
  let fixture: ComponentFixture<WaitConfirmation>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaitConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
