import { ComponentFixture, TestBed } from '@angular/core/testing';

import { googleMapComponent } from './google-map.component';

describe('googleMapComponent', () => {
  let component: googleMapComponent;
  let fixture: ComponentFixture<googleMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ googleMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(googleMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
