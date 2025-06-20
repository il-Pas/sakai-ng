import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrazioneEdificioComponent } from './registrazione-edificio.component';

describe('RegistrazioneEdificioComponent', () => {
  let component: RegistrazioneEdificioComponent;
  let fixture: ComponentFixture<RegistrazioneEdificioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrazioneEdificioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrazioneEdificioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
