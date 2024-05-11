import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAlertsComponent } from './new-alerts.component';

describe('NewAlertsComponent', () => {
  let component: NewAlertsComponent;
  let fixture: ComponentFixture<NewAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAlertsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
