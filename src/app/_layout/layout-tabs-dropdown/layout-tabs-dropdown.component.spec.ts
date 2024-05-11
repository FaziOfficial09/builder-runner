import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutTabsDropdownComponent } from './layout-tabs-dropdown.component';

describe('LayoutTabsDropdownComponent', () => {
  let component: LayoutTabsDropdownComponent;
  let fixture: ComponentFixture<LayoutTabsDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutTabsDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutTabsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
