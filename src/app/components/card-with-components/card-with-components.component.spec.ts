import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardWithComponentsComponent } from './card-with-components.component';

describe('CardWithComponentsComponent', () => {
  let component: CardWithComponentsComponent;
  let fixture: ComponentFixture<CardWithComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardWithComponentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardWithComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
