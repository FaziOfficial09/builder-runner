import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioVideoRecorderComponent } from './audio-video-recorder.component';

describe('AudioVideoRecorderComponent', () => {
  let component: AudioVideoRecorderComponent;
  let fixture: ComponentFixture<AudioVideoRecorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioVideoRecorderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioVideoRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
