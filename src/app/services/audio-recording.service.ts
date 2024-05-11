import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {StereoAudioRecorder} from 'recordrtc';
import { format, differenceInSeconds } from 'date-fns';

interface RecordedAudioOutput {
  blob: Blob;
  title: string;
}

@Injectable()
export class AudioRecordingService {

  private stream: any;
  private recorder: any;
  private interval: any;
  private startTime: Date | null = null; // Use Date object directly
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();

  getRecordedBlob(): Observable<RecordedAudioOutput> {
    return this._recorded.asObservable();
  }

  getRecordedTime(): Observable<string> {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }

  startRecording() {
    if (this.recorder) {
      return;
    }

    this._recordingTime.next('00:00');
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(s => {
        this.stream = s;
        this.record();
      }).catch(error => {
        this._recordingFailed.next('');
      });
  }

  abortRecording() {
    this.stopMedia();
  }

  private record() {
    this.recorder = new StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/webm'
    });

    this.recorder.record();
    this.startTime = new Date(); // Initialize startTime as a Date object
    this.interval = setInterval(() => {
      if (this.startTime) {
        const currentTime = new Date();
        const diffTime = differenceInSeconds(currentTime, this.startTime);
        const minutes = Math.floor(diffTime / 60);
        const seconds = diffTime % 60;
        const time = this.toString(minutes) + ':' + this.toString(seconds);
        this._recordingTime.next(time);
      }
    }, 500);
  }

  private toString(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop((blob: any) => {
        if (this.startTime) {
          const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
          this.stopMedia();
          this._recorded.next({ blob: blob, title: mp3Name });
        }
      }, () => {
        this.stopMedia();
        this._recordingFailed.next('');
      });
    }
  }

  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach((track: any) => track.stop());
        this.stream = null;
      }
    }
  }

}
