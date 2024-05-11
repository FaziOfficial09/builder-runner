import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit {
  @Input() audioData :any;
  constructor() { }

  ngOnInit(): void {

    this.audioData;
  }


}
