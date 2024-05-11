import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskReportComponent } from './task-report.component';

describe('TaskReportComponent', () => {
  let component: TaskReportComponent;
  let fixture: ComponentFixture<TaskReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
