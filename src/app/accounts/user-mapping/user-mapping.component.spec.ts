import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMappingComponent } from './user-mapping.component';

describe('UserMappingComponent', () => {
  let component: UserMappingComponent;
  let fixture: ComponentFixture<UserMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserMappingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
