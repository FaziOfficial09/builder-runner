import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorJsWrapperComponent } from './editor-js-wrapper.component';

describe('EditorJsWrapperComponent', () => {
  let component: EditorJsWrapperComponent;
  let fixture: ComponentFixture<EditorJsWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorJsWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorJsWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
