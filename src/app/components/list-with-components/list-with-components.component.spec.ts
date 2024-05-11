import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWithComponentsComponent } from './list-with-components.component';

describe('ListWithComponentsComponent', () => {
  let component: ListWithComponentsComponent;
  let fixture: ComponentFixture<ListWithComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListWithComponentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListWithComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
