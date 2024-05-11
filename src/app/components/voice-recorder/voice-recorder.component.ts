import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { AudioRecordingService } from 'src/app/services/audio-recording.service';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { VideoRecordingService } from 'src/app/services/video-recording.service';


@Component({
  selector: 'st-voice-recorder',
  templateUrl: './voice-recorder.component.html',
  styleUrls: ['./voice-recorder.component.scss']
})
export class VoiceRecorderComponent {
  @ViewChild('videoElement') videoElement: any;
  @Input() audioData: any;
  video: any;
  isPlaying = false;
  displayControls = true;
  isAudioRecording = false;
  isVideoRecording = false;
  audioRecordedTime: any;
  videoRecordedTime: any;
  audioBlobUrl: any;
  videoBlobUrl: any;
  audioBlob: any;
  videoBlob: any;
  audioName: any;
  videoName: any;
  audioStream: any;
  videoStream: MediaStream;
  audioConf = { audio: true }
  videoConf = { video: { facingMode: "user", width: 320 }, audio: true }

  constructor(
    private ref: ChangeDetectorRef,
    private audioRecordingService: AudioRecordingService,
    private videoRecordingService: VideoRecordingService,
    private sanitizer: DomSanitizer,
    public dataSharedService: DataSharedService
  ) {

    this.videoRecordingService.recordingFailed().subscribe(() => {
      this.isVideoRecording = false;
      this.ref.detectChanges();
    });

    this.videoRecordingService.getRecordedTime().subscribe((time) => {
      this.videoRecordedTime = time;
      this.ref.detectChanges();
    });

    this.videoRecordingService.getStream().subscribe((stream) => {
      this.videoStream = stream;
      this.ref.detectChanges();
    });

    this.videoRecordingService.getRecordedBlob().subscribe((data) => {
      this.videoBlob = data.blob;
      this.videoName = data.title;
      this.videoBlobUrl = this.sanitizer.bypassSecurityTrustUrl(data.url);
      this.ref.detectChanges();
    });

    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isAudioRecording = false;
      this.ref.detectChanges();
    });

    this.audioRecordingService.getRecordedTime().subscribe((time) => {
      this.audioRecordedTime = time;
      this.ref.detectChanges();
    });

    this.audioRecordingService.getRecordedBlob().subscribe((data) => {
      this.audioBlob = data.blob;
      this.audioName = data.title;
      this.audioBlobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
      blobToBase64(this.audioBlob)
        .then(base64Data => {
          this.dataSharedService.voiceRecord.next(base64Data);
        })
        .catch(error => {
          console.error('Error converting blob to base64:', error);
        });
      this.ref.detectChanges();
    });
  }

  ngOnInit() {
    this.video = this.videoElement.nativeElement;
  }
  ngOnChanges(changes: any) {
    if (changes.audioBlobUrl && changes.audioBlobUrl.currentValue) {
      // Update the audioBlobUrl when the input property changes
      this.audioBlobUrl = changes.audioBlobUrl.currentValue;
    }
  }

  startVideoRecording() {
    if (!this.isVideoRecording) {
      this.video.controls = false;
      this.isVideoRecording = true;
      this.videoRecordingService.startRecording(this.videoConf)
        .then((stream: any) => {
          // this.video.src = window.URL.createObjectURL(stream);
          this.video.srcObject = stream;
          this.video.play();
        })
        .catch(function (err: any) {
          console.log(err.name + ": " + err.message);
        });
    }
  }

  abortVideoRecording() {
    if (this.isVideoRecording) {
      this.isVideoRecording = false;
      this.videoRecordingService.abortRecording();
      this.video.controls = false;
    }
  }

  stopVideoRecording() {
    if (this.isVideoRecording) {
      this.videoRecordingService.stopRecording();
      this.video.srcObject = this.videoBlobUrl;
      this.isVideoRecording = false;
      this.video.controls = true;
    }
  }

  clearVideoRecordedData() {
    this.videoBlobUrl = null;
    this.video.srcObject = null;
    this.video.controls = false;
    this.ref.detectChanges();
  }

  downloadVideoRecordedData() {
    // this._downloadFile(this.videoBlob, 'video/mp4', this.videoName);
  }

  startAudioRecording() {
    if (!this.isAudioRecording) {
      this.isAudioRecording = true;
      this.audioRecordingService.startRecording();
    }
  }

  abortAudioRecording() {
    if (this.isAudioRecording) {
      this.isAudioRecording = false;
      this.audioRecordingService.abortRecording();
    }
  }

  stopAudioRecording() {
    if (this.isAudioRecording) {
      this.audioRecordingService.stopRecording();

      this.isAudioRecording = false;
    }
  }


  clearAudioRecordedData() {
    this.audioBlobUrl = null;
  }

  downloadAudioRecordedData() {
    this._downloadFile(this.audioBlob, 'audio/mp3', this.audioName);
  }

  ngOnDestroy(): void {
    this.abortAudioRecording();
  }

  _downloadFile(data: any, type: string, filename: string): any {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    //this.video.srcObject = stream;
    //const url = data;
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
function blobToBase64(blob: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
