import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttChartV2Component } from './gantt-chart-v2.component';

describe('GanttChartV2Component', () => {
  let component: GanttChartV2Component;
  let fixture: ComponentFixture<GanttChartV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GanttChartV2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GanttChartV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
