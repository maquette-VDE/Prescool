import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttenteConfirmation } from './attente-confirmation';

describe('AttenteConfirmation', () => {
  let component: AttenteConfirmation;
  let fixture: ComponentFixture<AttenteConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttenteConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttenteConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
