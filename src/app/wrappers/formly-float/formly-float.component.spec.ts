import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFloatComponent } from './formly-float.component';

describe('FormlyFloatComponent', () => {
  let component: FormlyFloatComponent;
  let fixture: ComponentFixture<FormlyFloatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormlyFloatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyFloatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
