import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatableControllComponent } from './repeatable-controll.component';

describe('RepeatableControllComponent', () => {
  let component: RepeatableControllComponent;
  let fixture: ComponentFixture<RepeatableControllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepeatableControllComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepeatableControllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
