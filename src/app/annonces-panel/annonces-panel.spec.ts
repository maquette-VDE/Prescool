import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnoncesPanel } from './annonces-panel';

describe('AnnoncesPanel', () => {
  let component: AnnoncesPanel;
  let fixture: ComponentFixture<AnnoncesPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnoncesPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnoncesPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
