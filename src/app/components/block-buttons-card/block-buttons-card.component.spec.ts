import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockButtonsCardComponent } from './block-buttons-card.component';

describe('BlockButtonsCardComponent', () => {
  let component: BlockButtonsCardComponent;
  let fixture: ComponentFixture<BlockButtonsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockButtonsCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockButtonsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
