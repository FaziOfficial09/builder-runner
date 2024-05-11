import { Injectable, NgZone } from '@angular/core';
import { RecordRTCPromisesHandler } from 'recordrtc';
import { Observable, Subject } from 'rxjs';
import { differenceInSeconds } from 'date-fns';

interface RecordedVideoOutput {
  blob: Blob;
  url: string;
  title: string;
}

@Injectable()
export class VideoRecordingService {

  private stream: any;
  private recorder: any;
  private interval: any;
  private startTime: Date | null = null;
  private _stream = new Subject<MediaStream>();
  private _recorded = new Subject<RecordedVideoOutput>();
  private _recordedUrl = new Subject<string>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();

  getRecordedUrl(): Observable<string> {
    return this._recordedUrl.asObservable();
  }
  
  getRecordedBlob(): Observable<RecordedVideoOutput> {
    return this._recorded.asObservable();
  }

  getRecordedTime(): Observable<string> {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }

  getStream(): Observable<MediaStream> {
    return this._stream.asObservable();
  }

  startRecording(conf: any): any {
    var browser = <any>navigator;
    if (this.recorder) {
      return;
    }

    this._recordingTime.next('00:00');
    return new Promise((resolve, reject) => {
      browser.mediaDevices.getUserMedia(conf).then((stream: any) => {
        this.stream = stream;
        this.record();
        resolve(this.stream);
      }).catch((error: any) => {
        this._recordingFailed.next('');
        reject(error);
      });
    });
  }

  abortRecording() {
    this.stopMedia();
  }

  private record() {
    this.recorder = new RecordRTCPromisesHandler(this.stream, {
      type: 'video',
      mimeType: 'video/webm',
      bitsPerSecond: 44000
    });
    this.recorder.startRecording();
    this.startTime = new Date(); // Start time as a Date object
    this.interval = setInterval(() => {
      if (this.startTime) {
        const currentTime = new Date();
        const diffTime = differenceInSeconds(currentTime, this.startTime);
        const minutes = Math.floor(diffTime / 60);
        const seconds = diffTime % 60;
        const time = this.toString(minutes) + ':' + this.toString(seconds);
        this._recordingTime.next(time);
        this._stream.next(this.stream);
      }
    }, 500);
  }

  private toString(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stopRecording(this.processVideo.bind(this));
    }
  }

  private processVideo(audioVideoWebMURL: any) {
    const recordedBlob = this.recorder.getBlob();
    const recordedName = encodeURIComponent('video_' + new Date().getTime() + '.webm');
    this._recorded.next({ blob: recordedBlob, url: audioVideoWebMURL, title: recordedName });
    this.stopMedia();
  }

  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach((track: any) => track.stop());
        this.stream.getVideoTracks().forEach((track: any) => track.stop());
        this.stream = null;
      }
    }
  }
}
