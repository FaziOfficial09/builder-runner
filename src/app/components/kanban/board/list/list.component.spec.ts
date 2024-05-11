import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListsComponent } from './list.component';

describe('ListComponent', () => {
  let component: ListsComponent;
  let fixture: ComponentFixture<ListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
