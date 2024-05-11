import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuControllComponent } from './menu-controll.component';

describe('MenuControllComponent', () => {
  let component: MenuControllComponent;
  let fixture: ComponentFixture<MenuControllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuControllComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuControllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
