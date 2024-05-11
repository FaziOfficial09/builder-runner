import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentCalendarComponent } from './parent-calendar.component';

describe('ParentCalendarComponent', () => {
  let component: ParentCalendarComponent;
  let fixture: ComponentFixture<ParentCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
