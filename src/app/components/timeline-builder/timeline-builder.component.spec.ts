import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineBuilderComponent } from './timeline-builder.component';

describe('TimelineBuilderComponent', () => {
  let component: TimelineBuilderComponent;
  let fixture: ComponentFixture<TimelineBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimelineBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
