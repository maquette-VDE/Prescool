import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Erreur } from './erreur';

describe('Erreur', () => {
  let component: Erreur;
  let fixture: ComponentFixture<Erreur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Erreur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Erreur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
