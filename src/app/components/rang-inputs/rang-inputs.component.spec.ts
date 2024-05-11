import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangInputsComponent } from './rang-inputs.component';

describe('RangInputsComponent', () => {
  let component: RangInputsComponent;
  let fixture: ComponentFixture<RangInputsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RangInputsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RangInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
