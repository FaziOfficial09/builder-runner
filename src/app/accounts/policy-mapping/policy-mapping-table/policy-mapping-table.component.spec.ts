import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyMappingTableComponent } from './policy-mapping-table.component';

describe('PolicyMappingTableComponent', () => {
  let component: PolicyMappingTableComponent;
  let fixture: ComponentFixture<PolicyMappingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicyMappingTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyMappingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
