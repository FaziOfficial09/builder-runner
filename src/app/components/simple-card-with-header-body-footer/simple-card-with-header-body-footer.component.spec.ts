import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleCardWithHeaderBodyFooterComponent } from './simple-card-with-header-body-footer.component';

describe('SimpleCardWithHeaderBodyFooterComponent', () => {
  let component: SimpleCardWithHeaderBodyFooterComponent;
  let fixture: ComponentFixture<SimpleCardWithHeaderBodyFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleCardWithHeaderBodyFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleCardWithHeaderBodyFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
