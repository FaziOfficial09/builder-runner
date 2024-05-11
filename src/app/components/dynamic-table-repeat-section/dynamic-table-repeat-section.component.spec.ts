import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTableRepeatSectionComponent } from './dynamic-table-repeat-section.component';

describe('DynamicTableRepeatSectionComponent', () => {
  let component: DynamicTableRepeatSectionComponent;
  let fixture: ComponentFixture<DynamicTableRepeatSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicTableRepeatSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicTableRepeatSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
