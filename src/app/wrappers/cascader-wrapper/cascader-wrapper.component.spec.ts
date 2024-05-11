import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CascaderWrapperComponent } from './cascader-wrapper.component';

describe('CascaderWrapperComponent', () => {
  let component: CascaderWrapperComponent;
  let fixture: ComponentFixture<CascaderWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CascaderWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CascaderWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
