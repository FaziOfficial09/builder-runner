import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiFileUploadWrapperComponent } from './multi-file-upload-wrapper.component';

describe('MultiFileUploadWrapperComponent', () => {
  let component: MultiFileUploadWrapperComponent;
  let fixture: ComponentFixture<MultiFileUploadWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiFileUploadWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiFileUploadWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
