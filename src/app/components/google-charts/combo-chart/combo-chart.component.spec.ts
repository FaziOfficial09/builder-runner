import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboChartComponent } from './combo-chart.component';

describe('ComboChartComponent', () => {
  let component: ComboChartComponent;
  let fixture: ComponentFixture<ComboChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComboChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComboChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
