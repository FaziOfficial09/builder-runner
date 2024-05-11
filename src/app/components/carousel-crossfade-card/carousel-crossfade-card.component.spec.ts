import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselCrossfadeCardComponent } from './carousel-crossfade-card.component';

describe('CarouselCrossfadeCardComponent', () => {
  let component: CarouselCrossfadeCardComponent;
  let fixture: ComponentFixture<CarouselCrossfadeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarouselCrossfadeCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselCrossfadeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
