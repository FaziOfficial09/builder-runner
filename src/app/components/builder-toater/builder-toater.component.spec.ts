import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderToaterComponent } from './builder-toater.component';

describe('BuilderToaterComponent', () => {
  let component: BuilderToaterComponent;
  let fixture: ComponentFixture<BuilderToaterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuilderToaterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderToaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
